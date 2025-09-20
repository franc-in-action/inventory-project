// main.js (CommonJS version)
import 'dotenv/config'; // instead of require("dotenv").config()
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import url from 'url';
import { registerIpcHandlers } from './ipcHandlers.js';
import { initDb } from './db/index.js';
import { startSyncWorker, setAuthToken } from './syncWorker.js';


const isDev = process.env.NODE_ENV === "development";

let mainWindow;

async function createWindow() {
    const userDataPath = app.getPath("userData");
    await initDb(userDataPath);

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (process.env.ELECTRON_START_URL) {
        await mainWindow.loadURL(process.env.ELECTRON_START_URL);
    } else if (isDev) {
        await mainWindow.loadURL("http://localhost:5144");
    } else {
        const indexPath = path.join(process.cwd(), "frontend", "dist", "index.html");
        await mainWindow.loadURL(url.pathToFileURL(indexPath).toString());
    }

    registerIpcHandlers();

    // Start background sync worker
    startSyncWorker();

    // Receive auth token from renderer
    ipcMain.on("auth-success", (_, token) => {
        console.log("Auth token received from renderer");
        setAuthToken(token);
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
