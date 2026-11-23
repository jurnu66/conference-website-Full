/**
 * Local preview server for dist/.
 * Run: npm start   then open http://127.0.0.1:8080
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT) || 8080;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".zip": "application/zip"
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end("Forbidden"); return; }
  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) { res.writeHead(301, { Location: rel + "/" }).end(); return; }
    if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("ไม่พบหน้านี้ (404)"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, "127.0.0.1", () => console.log(`เปิดเว็บได้ที่ http://127.0.0.1:${PORT}`));
