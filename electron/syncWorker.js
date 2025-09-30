// electron/syncWorker.js (CommonJS)
const axios = require("axios");

const SYNC_INTERVAL = 30 * 1000; // 30 seconds
const API_BASE = process.env.BACKEND_URL || "http://localhost:4044/api";

let syncTimer = null;
let token = null;
let dbInstance = null;

/**
 * Set the bearer token used for authenticated sync calls.
 */
function setAuthToken(t) {
    token = t;
}

/**
 * Inject a database instance for use in syncWorker.
 */
function setDb(db) {
    dbInstance = db;
}

/**
 * Get last known server sequence from device_meta.
 */
function getLastSeq() {
    const row = dbInstance
        .prepare("SELECT value FROM device_meta WHERE key = 'lastServerSeq'")
        .get();
    return row ? JSON.parse(row.value) : 0;
}

/**
 * Update last known server sequence in device_meta.
 */
function setLastSeq(seq) {
    const str = JSON.stringify(seq);
    const exists = dbInstance
        .prepare("SELECT key FROM device_meta WHERE key = 'lastServerSeq'")
        .get();
    if (exists) {
        dbInstance
            .prepare("UPDATE device_meta SET value = ? WHERE key = 'lastServerSeq'")
            .run(str);
    } else {
        dbInstance
            .prepare("INSERT INTO device_meta (key, value) VALUES ('lastServerSeq', ?)")
            .run(str);
    }
}

/**
 * Push all pending changes in the local sync_queue to the server.
 * On success, marks queue items as 'synced' and updates related entities.
 */
async function pushQueue(maxRetries = 5) {
    if (!token) return;
    if (!dbInstance) throw new Error("Database not initialized for syncWorker");

    try {
        const pending = dbInstance
            .prepare(
                `
        SELECT * FROM sync_queue
        WHERE status = 'pending' AND retry_count < ?
        ORDER BY id ASC
        LIMIT 50
      `
            )
            .all(maxRetries);

        if (pending.length === 0) return;

        const payload = pending.map((row) => ({
            entityType: row.entity_type,
            entityUuid: row.entity_uuid,
            payload: JSON.parse(row.payload),
        }));

        try {
            const res = await axios.post(
                `${API_BASE}/sync/push`,
                { changes: payload },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 200 && Array.isArray(res.data.results)) {
                const updateQueue = dbInstance.prepare(
                    "UPDATE sync_queue SET status = 'synced' WHERE id = ?"
                );
                const updateSales = dbInstance.prepare(
                    "UPDATE local_sales SET synced = 1 WHERE local_uuid = ?"
                );
                const updateAdjustments = dbInstance.prepare(
                    "UPDATE ledger_entries SET synced = 1 WHERE local_uuid = ?"
                );

                res.data.results.forEach((r, idx) => {
                    const local = pending[idx];
                    updateQueue.run(local.id);

                    if (local.entity_type.toLowerCase() === "sale") {
                        updateSales.run(local.entity_uuid);
                    }

                    if (local.entity_type.toLowerCase() === "adjustment") {
                        updateAdjustments.run(local.entity_uuid);
                    }
                });

                if (res.data.serverSeq) {
                    setLastSeq(res.data.serverSeq);
                }
            }
        } catch (err) {
            // On failure, increment retry_count
            const incRetry = dbInstance.prepare(
                "UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?"
            );
            pending.forEach((row) => incRetry.run(row.id));
            console.error("Push sync error:", err.message);
        }
    } catch (err) {
        console.error("pushQueue failed:", err.message);
    }
}

/**
 * Pull changes from server and apply them locally.
 */
async function pullChanges() {
    if (!token) return;
    if (!dbInstance) throw new Error("Database not initialized for syncWorker");

    try {
        const sinceSeq = getLastSeq();
        const res = await axios.get(`${API_BASE}/sync/pull`, {
            params: { since_seq: sinceSeq },
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200 && Array.isArray(res.data.changes)) {
            const insertProduct = dbInstance.prepare(`
        INSERT INTO products (id, sku, name, description, price, updatedAt)
        VALUES (@id, @sku, @name, @description, @price, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          sku=excluded.sku,
          name=excluded.name,
          description=excluded.description,
          price=excluded.price,
          updatedAt=excluded.updatedAt
      `);

            const insertSale = dbInstance.prepare(`
        INSERT OR IGNORE INTO local_sales (local_uuid, product_id, quantity, created_at, synced)
        VALUES (@local_uuid, @product_id, @quantity, @created_at, 1)
      `);

            const insertStockMovement = dbInstance.prepare(`
        INSERT OR IGNORE INTO stock_movements
        (movement_uuid, product_id, location_id, delta, reason, ref_id, created_at)
        VALUES (@movement_uuid, @product_id, @location_id, @delta, @reason, @ref_id, @created_at)
      `);

            const insertAdjustment = dbInstance.prepare(`
        INSERT OR IGNORE INTO ledger_entries
        (local_uuid, customer_id, amount, method, type, description, created_at, synced)
        VALUES (@local_uuid, @customer_id, @amount, @method, 'ADJUSTMENT', @description, @created_at, 1)
      `);

            for (const change of res.data.changes) {
                const { entityType, payload } = change;

                if (entityType === "Product") {
                    insertProduct.run({
                        id: payload.id,
                        sku: payload.sku,
                        name: payload.name,
                        description: payload.description ?? null,
                        price: payload.price ?? 0,
                        updatedAt: payload.updatedAt,
                    });
                }

                if (entityType === "Sale") {
                    insertSale.run({
                        local_uuid: payload.uuid,
                        product_id: payload.productId,
                        quantity: payload.quantity,
                        created_at: payload.createdAt,
                    });
                }

                if (entityType === "StockMovement") {
                    insertStockMovement.run({
                        movement_uuid: payload.uuid,
                        product_id: payload.productId,
                        location_id: payload.locationId,
                        delta: payload.delta,
                        reason: payload.reason,
                        ref_id: payload.refId,
                        created_at: payload.createdAt,
                    });
                }

                if (entityType === "Adjustment") {
                    insertAdjustment.run({
                        local_uuid: payload.uuid,
                        customer_id: payload.customerId,
                        amount: payload.amount,
                        method: payload.method,
                        description: payload.description,
                        created_at: payload.createdAt,
                    });
                }
            }

            if (res.data.serverSeq) {
                setLastSeq(res.data.serverSeq);
            }
        }
    } catch (err) {
        console.error("pullChanges failed:", err.message);
    }
}

/**
 * Perform a full sync: push local changes, then pull server changes.
 */
async function runSyncOnce() {
    await pushQueue();
    await pullChanges();
}

/**
 * Start the background sync worker.
 */
function startSyncWorker(runNow = false) {
    if (syncTimer) clearInterval(syncTimer);
    if (runNow) runSyncOnce();
    syncTimer = setInterval(runSyncOnce, SYNC_INTERVAL);
}

/**
 * Stop the background sync worker.
 */
function stopSyncWorker() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
}

module.exports = {
    setAuthToken,
    setDb,
    pushQueue,
    pullChanges,
    runSyncOnce,
    startSyncWorker,
    stopSyncWorker,
};
