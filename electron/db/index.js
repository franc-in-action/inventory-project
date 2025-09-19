// db/index.js
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

let db;

export function initDb(userDataPath) {
    return new Promise((resolve, reject) => {
        try {
            const dbPath = path.join(userDataPath, "local_cache.sqlite");
            const firstTime = !fs.existsSync(dbPath);
            db = new Database(dbPath);

            // enable WAL for concurrency
            db.pragma("journal_mode = WAL");

            if (firstTime) {
                runMigrations();
            } else {
                // optionally validate schema version
                runMigrations(); // safe: migrations will be idempotent
            }
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runMigrations() {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    db.exec(schemaSql);
}

// ---- Products CRUD ----
export function listProducts() {
    const stmt = db.prepare("SELECT * FROM products ORDER BY name ASC");
    return stmt.all();
}

export function getProduct(id) {
    const stmt = db.prepare("SELECT * FROM products WHERE id = ?");
    return stmt.get(id);
}

export function upsertProduct(product) {
    if (product.id) {
        const update = db.prepare(`
            UPDATE products
            SET sku=@sku, name=@name, description=@description,
                price=@price, updatedAt=@updatedAt
            WHERE id=@id
        `);
        const info = update.run({
            ...product,
            description: product.description ?? null,
            updatedAt: product.updatedAt || new Date().toISOString()
        });
        if (info.changes) return getProduct(product.id);
    }

    const id = product.id || generateId();
    const insert = db.prepare(`
        INSERT INTO products (id, sku, name, description, price, updatedAt)
        VALUES (@id, @sku, @name, @description, @price, @updatedAt)
    `);
    insert.run({
        ...product,
        id,
        description: product.description ?? null,
        updatedAt: product.updatedAt || new Date().toISOString()
    });
    return getProduct(id);
}


export function deleteProduct(id) {
    const stmt = db.prepare("DELETE FROM products WHERE id = ?");
    return stmt.run(id);
}

// ---- Stock movements (append-only ledger) ----
export function pushStockMovement(mv) {
    // mv: { movement_uuid, product_id, location_id, delta, reason, ref_id, created_at }
    // dedupe by movement_uuid
    const existing = db.prepare("SELECT id FROM stock_movements WHERE movement_uuid = ?").get(mv.movement_uuid);
    if (existing) return { id: existing.id, deduped: true };

    const stmt = db.prepare(`
    INSERT INTO stock_movements (movement_uuid, product_id, location_id, delta, reason, ref_id, created_at)
    VALUES (@movement_uuid, @product_id, @location_id, @delta, @reason, @ref_id, @created_at)
  `);
    const info = stmt.run({
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

export function listStockMovements() {
    return db.prepare("SELECT * FROM stock_movements ORDER BY created_at DESC").all();
}

// ---- Sync queue ----
export function enqueueSync(item) {
    // item is JSON blob with {entityType, entityUuid, payload}
    const stmt = db.prepare("INSERT INTO sync_queue (entity_type, entity_uuid, payload, queued_at) VALUES (?, ?, ?, ?)");
    const info = stmt.run(item.entityType, item.entityUuid, JSON.stringify(item.payload), new Date().toISOString());
    return info.lastInsertRowid;
}

export function peekSyncQueue() {
    return db.prepare("SELECT id, entity_type, entity_uuid, payload, queued_at FROM sync_queue ORDER BY id ASC").all()
        .map(r => ({ ...r, payload: JSON.parse(r.payload) }));
}

export function dequeueSync(id) {
    return db.prepare("DELETE FROM sync_queue WHERE id = ?").run(id);
}

// ---- Device meta ----
export function getDeviceMeta(key) {
    const row = db.prepare("SELECT value FROM device_meta WHERE key = ?").get(key);
    return row ? JSON.parse(row.value) : null;
}

export function setDeviceMeta(key, value) {
    const exists = db.prepare("SELECT key FROM device_meta WHERE key = ?").get(key);
    const str = JSON.stringify(value);
    if (exists) {
        return db.prepare("UPDATE device_meta SET value = ? WHERE key = ?").run(str, key);
    } else {
        return db.prepare("INSERT INTO device_meta (key, value) VALUES (?, ?)").run(key, str);
    }
}

export { db };

// helper id generator
function generateId() {
    // small cuid-like: timestamp + random
    return `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
