import { jest, test, expect, beforeEach } from "@jest/globals";
import axios from "axios";
import { db } from "../db/index.js";
import { pushQueue, setDb, setAuthToken } from "../syncWorker.js";

// Properly mock axios default export
jest.mock("axios");
const mockedAxios = axios; // in JS, axios.post will now be a jest.fn()

// Inject DB and token
setDb(db);
setAuthToken("test-token");

beforeEach(() => {
    // recreate sync_queue table
    db.prepare("DROP TABLE IF EXISTS sync_queue").run();
    db.prepare(`
        CREATE TABLE sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_uuid TEXT,
            payload TEXT NOT NULL,
            queued_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending'
        )
    `).run();

    db.prepare("DELETE FROM local_sales").run();
});

test("offline: queue item persists", async () => {
    const now = new Date().toISOString();
    db.prepare(`
        INSERT INTO sync_queue(entity_type, entity_uuid, payload, queued_at, status)
        VALUES('sale','uuid1','{}', ?, 'pending')
    `).run(now);

    // Ensure axios.post is a jest mock
    mockedAxios.post = jest.fn().mockRejectedValueOnce(new Error("offline"));

    await pushQueue();

    const count = db.prepare(
        "SELECT count(*) AS c FROM sync_queue WHERE status='pending'"
    ).get().c;

    expect(count).toBe(1);
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

    const remaining = db.prepare(
        "SELECT count(*) AS c FROM sync_queue WHERE status='pending'"
    ).get().c;
    expect(remaining).toBe(0);

    const synced = db.prepare(
        "SELECT synced FROM local_sales WHERE local_uuid='uuid1'"
    ).get();
    expect(synced.synced).toBe(1);
});
