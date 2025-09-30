// db/index.js (CommonJS)

const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// --- Singleton DB ---
let db;

// Allow optional custom path (for tests)
function initDb(userDataPath = null) {
    if (db) return db; // already initialized

    const basePath = userDataPath || path.join(process.cwd(), "electron-data");
    fs.mkdirSync(basePath, { recursive: true });

    const dbPath = path.join(basePath, "local_cache.sqlite");
    const firstTime = !fs.existsSync(dbPath);

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL"); // enable WAL

    runMigrations(firstTime);

    return db;
}

function runMigrations(firstTime) {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    db.exec(schemaSql);
}

// auto-init singleton with default folder
initDb();

// ---- Products CRUD ----
function listProducts() {
    return db.prepare("SELECT * FROM products ORDER BY name ASC").all();
}

function getProduct(id) {
    return db.prepare("SELECT * FROM products WHERE id = ?").get(id);
}

function upsertProduct(product) {
    if (product.id) {
        const info = db.prepare(`
            UPDATE products
            SET sku=@sku, name=@name, description=@description,
                price=@price, updatedAt=@updatedAt
            WHERE id=@id
        `).run({
            ...product,
            description: product.description ?? null,
            updatedAt: product.updatedAt || new Date().toISOString(),
        });
        if (info.changes) return getProduct(product.id);
    }

    const id = product.id || generateId();
    db.prepare(`
        INSERT INTO products (id, sku, name, description, price, updatedAt)
        VALUES (@id, @sku, @name, @description, @price, @updatedAt)
    `).run({
        ...product,
        id,
        description: product.description ?? null,
        updatedAt: product.updatedAt || new Date().toISOString(),
    });
    return getProduct(id);
}

function deleteProduct(id) {
    return db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

// ---- Stock movements ----
function pushStockMovement(mv) {
    const existing = db.prepare("SELECT id FROM stock_movements WHERE movement_uuid = ?").get(mv.movement_uuid);
    if (existing) return { id: existing.id, deduped: true };

    const info = db.prepare(`
        INSERT INTO stock_movements (movement_uuid, product_id, location_id, delta, reason, ref_id, created_at)
        VALUES (@movement_uuid, @product_id, @location_id, @delta, @reason, @ref_id, @created_at)
    `).run({
        movement_uuid: mv.movement_uuid,
        product_id: mv.product_id,
        location_id: mv.location_id || null,
        delta: mv.delta,
        reason: mv.reason || "local",
        ref_id: mv.ref_id || null,
        created_at: mv.created_at || new Date().toISOString(),
    });
    return { id: info.lastInsertRowid, deduped: false };
}

function listStockMovements() {
    return db.prepare("SELECT * FROM stock_movements ORDER BY created_at DESC").all();
}

// ---- Sync queue ----
function enqueueSync(item) {
    const info = db.prepare(`
        INSERT INTO sync_queue (entity_type, entity_uuid, payload)
        VALUES (?, ?, ?)
    `).run(item.entityType, item.entityUuid, JSON.stringify(item.payload));
    return info.lastInsertRowid;
}

function peekSyncQueue() {
    return db.prepare("SELECT id, entity_type, entity_uuid, payload, queued_at FROM sync_queue ORDER BY id ASC").all()
        .map(r => ({ ...r, payload: JSON.parse(r.payload) }));
}

function dequeueSync(id) {
    return db.prepare("DELETE FROM sync_queue WHERE id = ?").run(id);
}

// ---- Device meta ----
function getDeviceMeta(key) {
    const row = db.prepare("SELECT value FROM device_meta WHERE key = ?").get(key);
    return row ? JSON.parse(row.value) : null;
}

function setDeviceMeta(key, value) {
    const str = JSON.stringify(value);
    const exists = db.prepare("SELECT key FROM device_meta WHERE key = ?").get(key);
    if (exists) {
        return db.prepare("UPDATE device_meta SET value = ? WHERE key = ?").run(str, key);
    } else {
        return db.prepare("INSERT INTO device_meta (key, value) VALUES (?, ?)").run(key, str);
    }
}

// --- Helper ---
function generateId() {
    return `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// --- Export everything ---
module.exports = {
    initDb,
    listProducts,
    getProduct,
    upsertProduct,
    deleteProduct,
    pushStockMovement,
    listStockMovements,
    enqueueSync,
    peekSyncQueue,
    dequeueSync,
    getDeviceMeta,
    setDeviceMeta,
    db
};
