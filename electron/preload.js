// preload.js
import { contextBridge, ipcRenderer } from "electron";

const API = {
    products: {
        list: () => ipcRenderer.invoke("products:list"),
        get: (id) => ipcRenderer.invoke("products:get", id),
        create: (data) => ipcRenderer.invoke("products:create", data),
        update: (id, data) => ipcRenderer.invoke("products:update", id, data),
        delete: (id) => ipcRenderer.invoke("products:delete", id),
    },
    stock: {
        pushMovement: (movement) => ipcRenderer.invoke("stock:pushMovement", movement),
        listMovements: (filters) => ipcRenderer.invoke("stock:listMovements", filters),
    },
    syncQueue: {
        enqueue: (item) => ipcRenderer.invoke("sync:enqueue", item),
        peekAll: () => ipcRenderer.invoke("sync:peekAll"),
        dequeue: (id) => ipcRenderer.invoke("sync:dequeue", id),
    },
    deviceMeta: {
        get: (key) => ipcRenderer.invoke("deviceMeta:get", key),
        set: (key, value) => ipcRenderer.invoke("deviceMeta:set", key, value),
    },
    authSuccess: (token) => ipcRenderer.send("auth-success", token),
    // helper to listen to events from main if needed
    on: (channel, cb) => {
        const valid = ["sync:status", "db:updated"];
        if (!valid.includes(channel)) return;
        ipcRenderer.on(channel, (event, ...args) => cb(...args));
    },
    getLocalDbState: async () => {
        const [products, stock] = await Promise.all([
            ipcRenderer.invoke("products:list"),
            ipcRenderer.invoke("stock:listMovements"),
        ]);
        return { products, stockMovements: stock };
    },
    syncNow: () => ipcRenderer.invoke("sync:now"),
};

contextBridge.exposeInMainWorld("electronAPI", API);
