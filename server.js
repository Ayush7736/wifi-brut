const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let latestText = "Hello from AI Backend!";
const history = [];

// Routes
app.get("/get-text", (req, res) => res.json({ text: latestText }));

app.post("/set-text", (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
        return res.status(400).json({ success: false, error: "Text required" });
    }
    latestText = text;
    history.push({ text, timestamp: new Date().toISOString() });
    res.json({ success: true });
});

app.get("/history", (req, res) => res.json({ history: history.slice(-20) }));

app.delete("/clear", (req, res) => {
    latestText = "";
    res.json({ success: true });
});

app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
