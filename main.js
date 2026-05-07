const { app, BrowserWindow, ipcMain } = require("electron");
const { exec } = require("child_process");
const fs = require("fs");

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile("index.html");
}

// Real WiFi Scan
ipcMain.handle("wifi-scan", async () => {
    return new Promise((resolve) => {
        exec("netsh wlan show networks mode=Bssid", (err, stdout) => {
            if (err) return resolve([]);
            const ssids = [];
            stdout.split("\n").forEach(line => {
                if (line.includes("SSID") && line.includes(":")) {
                    const name = line.split(":")[1].trim();
                    if (name && !ssids.includes(name)) ssids.push(name);
                }
            });
            resolve(ssids);
        });
    });
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
