import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const ROOMS_FILE = path.join(DATA_DIR, "rooms.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helper to read/write JSON
const readDB = (file: string, fallback: any) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
};

const writeDB = (file: string, data: any) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/rooms", (req, res) => {
    const rooms = readDB(ROOMS_FILE, []);
    res.json(rooms);
  });

  app.post("/api/rooms", (req, res) => {
    writeDB(ROOMS_FILE, req.body);
    res.sendStatus(200);
  });

  app.get("/api/sessions", (req, res) => {
    const sessions = readDB(SESSIONS_FILE, []);
    res.json(sessions);
  });

  app.post("/api/sessions", (req, res) => {
    writeDB(SESSIONS_FILE, req.body);
    res.sendStatus(200);
  });

  app.post("/api/rooms/:id/heartbeat", (req, res) => {
    const rooms = readDB(ROOMS_FILE, []);
    const updatedRooms = rooms.map((r: any) => 
      r.id === req.params.id ? { ...r, lastHeartbeat: Date.now() } : r
    );
    writeDB(ROOMS_FILE, updatedRooms);
    res.sendStatus(200);
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
