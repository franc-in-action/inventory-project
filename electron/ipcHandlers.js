// ipcHandlers.js
import { ipcMain } from "electron";
import { startSyncWorker } from "./syncWorker.js";
import * as db from "./db/index.js";

export function registerIpcHandlers() {
    // Products
    ipcMain.handle("products:list", async () => {
        return db.listProducts();
    });

    ipcMain.handle("products:get", async (event, id) => {
        return db.getProduct(id);
    });

    ipcMain.handle("products:create", async (event, data) => {
        const created = db.upsertProduct(data);
        // optionally notify renderer(s)
        return created;
    });

    ipcMain.handle("products:update", async (event, id, data) => {
        data.id = id;
        const updated = db.upsertProduct(data);
        return updated;
    });

    ipcMain.handle("products:delete", async (event, id) => {
        return db.deleteProduct(id);
    });

    // Stock movements
    ipcMain.handle("stock:pushMovement", async (event, mv) => {
        return db.pushStockMovement(mv);
    });

    ipcMain.handle("stock:listMovements", async () => {
        return db.listStockMovements();
    });

    ipcMain.handle("sales:create", async (_event, sale) => {
        const local_uuid = crypto.randomUUID();
        db.prepare(`
    INSERT INTO local_sales(local_uuid, product_id, quantity)
    VALUES (?, ?, ?)
  `).run(local_uuid, sale.product_id, sale.quantity);

        // queue a payload for push
        db.prepare(`
    INSERT INTO sync_queue(payload, status)
    VALUES (?, 'pending')
  `).run(JSON.stringify({ type: "sale", local_uuid }));

        return { local_uuid };
    });

    // Sync queue
    ipcMain.handle("sync:enqueue", async (event, item) => {
        return db.enqueueSync(item);
    });

    ipcMain.handle("sync:peekAll", async () => {
        return db.peekSyncQueue();
    });

    ipcMain.handle("sync:dequeue", async (event, id) => {
        return db.dequeueSync(id);
    });

    // device meta
    ipcMain.handle("deviceMeta:get", async (event, key) => {
        return db.getDeviceMeta(key);
    });

    ipcMain.handle("deviceMeta:set", async (event, key, value) => {
        return db.setDeviceMeta(key, value);
    });

    ipcMain.handle("sync:now", async () => {
        await startSyncWorker(true); // add a “run once now” option
    });
}
