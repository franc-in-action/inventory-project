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

    beforeEach(() => {
        dbModule.db.prepare("DELETE FROM products").run();
        dbModule.db.prepare("DELETE FROM stock_movements").run();
        dbModule.db.prepare("DELETE FROM sync_queue").run();
        dbModule.db.prepare("DELETE FROM local_sales").run();
    });

    afterAll(() => {
        const dbPath = path.join(tmpDir, "local_cache.sqlite");
        if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    });

    test("upsert and list products", () => {
        const p = { sku: `T${Date.now()}`, name: "Test", price: 12.5 };
        const created = dbModule.upsertProduct(p);
        expect(created.sku).toBe(p.sku);

        const all = dbModule.listProducts();
        expect(all.length).toBeGreaterThanOrEqual(1);
    });

    test("pushStockMovement dedupe", () => {
        const mv = {
            movement_uuid: `mv-${Date.now()}`,
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
        const id = dbModule.enqueueSync({ entityType: "Product", entityUuid: `p-${Date.now()}`, payload: { foo: 1 } });
        const items = dbModule.peekSyncQueue();
        expect(items.length).toBeGreaterThanOrEqual(1);

        dbModule.dequeueSync(id);
        const after = dbModule.peekSyncQueue();
        expect(after.find(i => i.id === id)).toBeUndefined();
    });
});
