PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price REAL DEFAULT 0,
    updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS local_sales (
    local_uuid TEXT PRIMARY KEY,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime ('now')),
    synced INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movement_uuid TEXT UNIQUE,
    product_id TEXT,
    location_id TEXT,
    delta INTEGER NOT NULL,
    reason TEXT,
    ref_id TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS device_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_uuid TEXT,
    payload TEXT NOT NULL,
    queued_at TEXT NOT NULL DEFAULT (datetime ('now')),
    status TEXT NOT NULL DEFAULT 'pending',
    retry_count INTEGER NOT NULL DEFAULT 0
);

-- NEW: adjustments + ledger entries
CREATE TABLE IF NOT EXISTS ledger_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    local_uuid TEXT UNIQUE,
    customer_id TEXT NOT NULL,
    amount REAL NOT NULL,
    method TEXT,
    type TEXT NOT NULL, -- e.g. 'ADJUSTMENT'
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entity_uuid ON sync_queue (entity_uuid);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_type ON ledger_entries (type);
