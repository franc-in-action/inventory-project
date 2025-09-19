// electron/syncWorker.js

import axios from "axios";
import { db } from "./db/index.js";

const SYNC_INTERVAL = 30 * 1000; // 30 seconds

const API_BASE = process.env.BACKEND_URL || "http://localhost:4044/api";

let syncTimer = null;
let token = null;

export function setAuthToken(t) {
    token = t;
}

async function pushQueue() {
    if (!token) return;

    try {
        const pending = db
            .prepare("SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY id ASC LIMIT 50")
            .all();

        if (pending.length === 0) return;

        const payload = pending.map((row) => ({
            entityType: row.entity_type,
            entityUuid: row.entity_uuid,
            payload: JSON.parse(row.payload),
        }));

        const res = await axios.post(
            `${API_BASE}/sync/push`,
            { changes: payload },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 200 && Array.isArray(res.data.results)) {
            const stmt = db.prepare("UPDATE sync_queue SET status = 'synced' WHERE id = ?");
            res.data.results.forEach((r, idx) => {
                const local = pending[idx];
                stmt.run(local.id);
            });
        }
    } catch (err) {
        console.error("Sync error:", err.message);
    }
}

export async function runSyncOnce() { await pushQueue(); }

export function startSyncWorker(runNow = false) {
    if (syncTimer) clearInterval(syncTimer);
    if (runNow) pushQueue();
    syncTimer = setInterval(pushQueue, SYNC_INTERVAL);
}

export function stopSyncWorker() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
}
