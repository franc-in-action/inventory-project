// electron/syncWorker.js
import axios from "axios";

const SYNC_INTERVAL = 30 * 1000; // 30 seconds
const API_BASE = process.env.BACKEND_URL || "http://localhost:4044/api";

let syncTimer = null;
let token = null;
let dbInstance = null; // inject DB here

/**
 * Set the bearer token used for authenticated sync calls.
 */
export function setAuthToken(t) {
    token = t;
}

/**
 * Inject a database instance for use in syncWorker.
 * If not injected, the module must use the default DB import.
 */
export function setDb(db) {
    dbInstance = db;
}

/**
 * Push all pending changes in the local sync_queue to the server.
 * On success, marks queue items as 'synced' and updates related entities.
 */
export async function pushQueue(maxRetries = 5) {
    if (!token) return;
    if (!dbInstance) throw new Error("Database not initialized for syncWorker");

    try {
        const pending = dbInstance
            .prepare(
                "SELECT * FROM sync_queue WHERE status = 'pending' AND retry_count < ? ORDER BY id ASC LIMIT 50"
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

                res.data.results.forEach((r, idx) => {
                    const local = pending[idx];
                    updateQueue.run(local.id);

                    if (local.entity_type === "sale") {
                        updateSales.run(local.entity_uuid);
                    }
                });
            }
        } catch (err) {
            // On failure, increment retry_count
            const incRetry = dbInstance.prepare(
                "UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?"
            );
            pending.forEach((row) => incRetry.run(row.id));
            console.error("Sync error:", err.message);
        }
    } catch (err) {
        console.error("pushQueue failed:", err.message);
    }
}


/**
 * Convenience function to trigger a single sync attempt immediately.
 */
export async function runSyncOnce() {
    await pushQueue();
}

/**
 * Start the background sync worker.
 * @param {boolean} runNow - if true, performs an immediate sync attempt.
 */
export function startSyncWorker(runNow = false) {
    if (syncTimer) clearInterval(syncTimer);
    if (runNow) pushQueue();
    syncTimer = setInterval(pushQueue, SYNC_INTERVAL);
}

/**
 * Stop the background sync worker.
 */
export function stopSyncWorker() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
}
