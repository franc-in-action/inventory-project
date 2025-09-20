import { jest, test, expect, beforeEach } from "@jest/globals";
import axios from "axios";
import { db } from "../db/index.js";
import { pushQueue, setDb, setAuthToken } from "../syncWorker.js";

// Properly mock axios default export
jest.mock("axios");
const mockedAxios = axios;

// Inject DB and token
setDb(db);
setAuthToken("test-token");

beforeEach(() => {
    // Recreate sync_queue table
    db.prepare("DROP TABLE IF EXISTS sync_queue").run();
    db.prepare(`
        CREATE TABLE sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_uuid TEXT,
            payload TEXT NOT NULL,
            queued_at TEXT NOT NULL DEFAULT (datetime('now')),
            status TEXT NOT NULL DEFAULT 'pending',
            retry_count INTEGER NOT NULL DEFAULT 0
        )
    `).run();

    db.prepare("DELETE FROM local_sales").run();
});

test("offline: queue item persists and retry_count increments", async () => {
    const now = new Date().toISOString();
    const insert = db.prepare(`
        INSERT INTO sync_queue(entity_type, entity_uuid, payload, queued_at, status)
        VALUES('sale','uuid1','{}', ?, 'pending')
    `);
    insert.run(now);

    // axios fails
    mockedAxios.post = jest.fn().mockRejectedValueOnce(new Error("offline"));

    await pushQueue();

    const item = db.prepare("SELECT * FROM sync_queue WHERE entity_uuid='uuid1'").get();

    expect(item.status).toBe("pending");      // Still pending
    expect(item.retry_count).toBe(1);         // Retry incremented
});

test("network recovers: queue cleared & sale marked", async () => {
    const now = new Date().toISOString();
    db.prepare(`
        INSERT INTO sync_queue(entity_type, entity_uuid, payload, queued_at, status)
        VALUES('sale','uuid1','{}', ?, 'pending')
    `).run(now);

    db.prepare(`
        INSERT INTO local_sales(local_uuid, synced, product_id, quantity)
        VALUES('uuid1', 0, 1, 1)
    `).run();

    mockedAxios.post = jest.fn().mockResolvedValueOnce({ status: 200, data: { results: [{}] } });

    await pushQueue();

    const remaining = db.prepare("SELECT count(*) AS c FROM sync_queue WHERE status='pending'").get().c;
    expect(remaining).toBe(0);

    const synced = db.prepare("SELECT synced FROM local_sales WHERE local_uuid='uuid1'").get();
    expect(synced.synced).toBe(1);
});

test("queue item stops retrying after maxRetries", async () => {
    const now = new Date().toISOString();
    const maxRetries = 3;

    db.prepare(`
        INSERT INTO sync_queue(entity_type, entity_uuid, payload, queued_at, status, retry_count)
        VALUES('sale','uuid-fail','{}', ?, 'pending', 0)
    `).run(now);

    // axios always fails
    mockedAxios.post = jest.fn().mockRejectedValue(new Error("offline"));

    // Call pushQueue maxRetries + 2 times to simulate multiple sync attempts
    for (let i = 0; i < maxRetries + 2; i++) {
        await pushQueue(maxRetries);
    }

    const item = db.prepare("SELECT * FROM sync_queue WHERE entity_uuid='uuid-fail'").get();

    // Status should still be pending because it never succeeded
    expect(item.status).toBe("pending");

    // Retry count should not exceed maxRetries
    expect(item.retry_count).toBe(maxRetries);
});

