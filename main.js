const { app, BrowserWindow, ipcMain } = require("electron");
const robot = require("robotjs");
const { exec } = require("child_process");
const fs = require("fs");

function createWindow() {
    const win = new BrowserWindow({
        width: 940,
        height: 760,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile("index.html");
}

// AI Typer
ipcMain.handle("type-string", async (event, text) => {
    robot.setKeyboardDelay(10);
    robot.typeString(text);
    return { success: true };
});

// WiFi Manager
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

ipcMain.handle("wifi-connect", async (event, { ssid, password }) => {
    return new Promise((resolve) => {
        const profile = `<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
    <name>${ssid}</name>
    <SSIDConfig><SSID><name>${ssid}</name></SSID></SSIDConfig>
    <connectionType>ESS</connectionType>
    <connectionMode>manual</connectionMode>
    <MSM>
        <security>
            <authEncryption>
                <authentication>WPA2PSK</authentication>
                <encryption>AES</encryption>
                <useOneX>false</useOneX>
            </authEncryption>
            <sharedKey>
                <keyType>passPhrase</keyType>
                <protected>false</protected>
                <keyMaterial>${password}</keyMaterial>
            </sharedKey>
        </security>
    </MSM>
</WLANProfile>`;

        try {
            fs.writeFileSync("wifi.xml", profile);
            exec(`netsh wlan add profile filename="wifi.xml"`, () => {
                exec(`netsh wlan connect name="${ssid}"`, () => {
                    setTimeout(() => {
                        exec("netsh wlan show interfaces", (err, stdout) => {
                            if (stdout && stdout.includes(ssid)) {
                                resolve("✅ Connected successfully!");
                            } else {
                                resolve("❌ Connection failed. Check password.");
                            }
                        });
                    }, 2500);
                });
            });
        } catch (e) {
            resolve("❌ Error creating WiFi profile");
        }
    });
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
