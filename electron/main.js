// main.js (CommonJS)

require("dotenv").config();
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");

const { registerIpcHandlers } = require("./ipcHandlers");
const { initDb } = require("./db/index");
const { startSyncWorker, setAuthToken } = require("./syncWorker");

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
        // Dev server URL (Vite/CRA)
        await mainWindow.loadURL(process.env.ELECTRON_START_URL);
    } else if (isDev) {
        // Fallback for dev
        await mainWindow.loadURL("http://localhost:5144");
    } else {
        // ✅ Correct production path: ../frontend/dist/index.html
        const indexPath = path.join(__dirname, "..", "frontend", "dist", "index.html");
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
