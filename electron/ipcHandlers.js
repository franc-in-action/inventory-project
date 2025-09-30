// ipcHandlers.js (CommonJS)

const { ipcMain } = require("electron");
const crypto = require("crypto");
const { startSyncWorker } = require("./syncWorker.js");
const db = require("./db/index.js");

function registerIpcHandlers() {
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

    // Sales
    ipcMain.handle("sales:create", async (_event, sale) => {
        const local_uuid = crypto.randomUUID();

        db.db.prepare(`
            INSERT INTO local_sales(local_uuid, product_id, quantity)
            VALUES (?, ?, ?)
        `).run(local_uuid, sale.product_id, sale.quantity);

        // queue a payload for push
        db.db.prepare(`
            INSERT INTO sync_queue(payload, status)
            VALUES (?, 'pending')
        `).run(JSON.stringify({ type: "sale", local_uuid }));

        return { local_uuid };
    });

    // =========================
    // Adjustments
    // =========================

    // CREATE adjustment
    ipcMain.handle("adjustments:create", async (_event, data) => {
        const local_uuid = crypto.randomUUID();

        const adjustment = db.createAdjustment({
            local_uuid,
            customerId: data.customerId,
            amount: data.amount,
            method: data.method,
            description: data.description || `Manual adjustment of ${data.amount}`,
        });

        // queue sync
        db.enqueueSync({
            entityType: "adjustment",
            entityUuid: local_uuid,
            payload: adjustment,
        });

        return adjustment;
    });

    ipcMain.handle("adjustments:list", async () => {
        return db.listAdjustments();
    });

    ipcMain.handle("adjustments:get", async (_event, id) => {
        return db.getAdjustmentById(id);
    });

    ipcMain.handle("adjustments:update", async (_event, id, data) => {
        return db.updateAdjustment(id, data);
    });

    ipcMain.handle("adjustments:delete", async (_event, id) => {
        db.deleteAdjustment(id);
        return { success: true };
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

    // Device meta
    ipcMain.handle("deviceMeta:get", async (event, key) => {
        return db.getDeviceMeta(key);
    });

    ipcMain.handle("deviceMeta:set", async (event, key, value) => {
        return db.setDeviceMeta(key, value);
    });

    // Trigger sync immediately
    ipcMain.handle("sync:now", async () => {
        await startSyncWorker(true);
    });
}

module.exports = { registerIpcHandlers };
