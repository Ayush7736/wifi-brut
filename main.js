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

// Auto Type function
ipcMain.handle("auto-type", async (event, text) => {
    try {
        robot.setKeyboardDelay(15);
        robot.typeString(text);
        return { success: true };
    } catch (e) {
        return { success: false };
    }
});

app.whenReady().then(createWindow);
