// tests/db.test.js
import fs from "fs";
import os from "os";
import path from "path";
import * as dbModule from "../db/index.js";

describe("Local DB (sqlite) wrapper", () => {
    const tmpDir = path.join(os.tmpdir(), `inv-test-${Date.now()}`);
    beforeAll(async () => {
        fs.mkdirSync(tmpDir, { recursive: true });
        await dbModule.initDb(tmpDir);
    });

    afterAll(() => {
        // close is implicit with better-sqlite3 when process ends. If you add a close, call it.
        // clean up file
        const dbPath = path.join(tmpDir, "local_cache.sqlite");
        if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    });

    test("upsert and list products", () => {
        const p = { sku: "T001", name: "Test", price: 12.5 };
        const created = dbModule.upsertProduct(p);
        expect(created.sku).toBe("T001");

        const all = dbModule.listProducts();
        expect(all.length).toBeGreaterThanOrEqual(1);
    });

    test("pushStockMovement dedupe", () => {
        const mv = {
            movement_uuid: "mv-1",
            product_id: null,
            delta: 5,
            reason: "test",
        };
        const r1 = dbModule.pushStockMovement(mv);
        expect(r1.deduped).toBe(false);

        const r2 = dbModule.pushStockMovement(mv);
        expect(r2.deduped).toBe(true);
    });

    test("sync queue enqueue/dequeue", () => {
        const id = dbModule.enqueueSync({ entityType: "Product", entityUuid: "p-1", payload: { foo: 1 } });
        const items = dbModule.peekSyncQueue();
        expect(items.length).toBeGreaterThanOrEqual(1);
        dbModule.dequeueSync(id);
        const after = dbModule.peekSyncQueue();
        // item removed
        expect(after.find(i => i.id === id)).toBeUndefined();
    });
});
