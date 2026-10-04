const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "db.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return { players: [], results: [], questions: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing db.json:", err);
    return false;
  }
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // --- HEALTH / STATUS ENDPOINT ---
  if (pathname === "/status" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "online", time: new Date().toISOString() }));
    return;
  }

  // --- REST API ENDPOINTS ---
  if (pathname === "/questions" && req.method === "GET") {
    const db = readDb();
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(db.questions || []));
    return;
  }

  if (pathname === "/players") {
    const db = readDb();
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(db.players || []));
      return;
    }
    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", () => {
        try {
          const item = JSON.parse(body || "{}");
          item.id = (db.players && db.players.length > 0) ? Math.max(...db.players.map(p => p.id || 0)) + 1 : 1;
          if (!db.players) db.players = [];
          db.players.push(item);
          writeDb(db);
          res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify(item));
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }
  }

  if (pathname === "/results") {
    const db = readDb();
    if (req.method === "GET") {
      let results = [...(db.results || [])];
      // Sort desc by createdAt
      results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(results));
      return;
    }
    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", () => {
        try {
          const item = JSON.parse(body || "{}");
          item.id = (db.results && db.results.length > 0) ? Math.max(...db.results.map(r => r.id || 0)) + 1 : 1;
          if (!db.results) db.results = [];
          db.results.push(item);
          writeDb(db);
          res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify(item));
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }
  }

  // --- RESET ALL DATA ---
  if (pathname === "/reset" && req.method === "POST") {
    const db = readDb();
    db.players = [];
    db.results = [];
    writeDb(db);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ success: true, message: "Cleared all players and results" }));
    return;
  }

  // --- SEED SAMPLE DEMO DATA ---
  if (pathname === "/seed" && req.method === "POST") {
    const db = readDb();
    const demoSamples = [
      { name: "Minh Anh", universe: "growth", scores: { growth: 4, experience: 1, product: 1, bugHunter: 1, aiFuture: 0 } },
      { name: "Hoàng Long", universe: "aiFuture", scores: { growth: 0, experience: 1, product: 1, bugHunter: 0, aiFuture: 5 } },
      { name: "Thu Hà", universe: "experience", scores: { growth: 1, experience: 4, product: 1, bugHunter: 1, aiFuture: 0 } },
      { name: "Đức Thắng", universe: "bugHunter", scores: { growth: 0, experience: 0, product: 1, bugHunter: 5, aiFuture: 1 } },
      { name: "Phương Linh", universe: "product", scores: { growth: 1, experience: 1, product: 4, bugHunter: 0, aiFuture: 1 } }
    ];

    if (!db.players) db.players = [];
    if (!db.results) db.results = [];

    demoSamples.forEach((s, idx) => {
      const pId = db.players.length + 1;
      const rId = db.results.length + 1;
      const now = new Date(Date.now() - idx * 35000).toISOString();
      db.players.push({ id: pId, name: s.name, joinedAt: now });
      db.results.push({ id: rId, playerId: pId, playerName: s.name, scores: s.scores, primaryUniverse: s.universe, createdAt: now });
    });

    writeDb(db);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ success: true, count: demoSamples.length }));
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = pathname === "/" ? "/index.html" : pathname;
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, "");
  const fullPath = path.join(__dirname, filePath);

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<h1>404 Not Found</h1><p>File not found: ${pathname}</p>`);
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(fullPath).pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(`  Web Multiverse Server is RUNNING on PORT ${PORT}!`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Admin:   http://localhost:${PORT}/admin.html`);
  console.log(`====================================================`);
});
