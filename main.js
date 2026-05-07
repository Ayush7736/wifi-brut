const { app, BrowserWindow, ipcMain } = require("electron");
const robot = require("robotjs");

function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 780,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadFile("index.html");
}

ipcMain.handle("auto-type", async (event, text) => {
    robot.setKeyboardDelay(10);
    robot.typeString(text);
    return { success: true };
});

app.whenReady().then(createWindow);
