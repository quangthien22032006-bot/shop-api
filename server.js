const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const storePath = path.join(root, "du-lieu.json");
function readDb(){ try { return JSON.parse(fs.readFileSync(storePath, 'utf8')); } catch (e) { return {}; } }
function writeDb(db){ fs.writeFileSync(storePath, JSON.stringify(db, null, 2)); }
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.css':'text/css' };
const port = Number(process.env.PORT) || 8787;
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST' }); res.end(); return; }
  if (url.pathname === '/api/du-lieu' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(readDb())); return;
  }
  if (url.pathname === '/api/du-lieu' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 500000) req.destroy(); });
    req.on('end', () => {
      try { writeDb(JSON.parse(body || '{}')); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); }
      catch (e) { res.writeHead(400); res.end('JSON sai'); }
    });
    return;
  }
  let rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const full = path.normalize(path.join(root, rel));
  if (!full.startsWith(root) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.writeHead(404); res.end('Khong thay'); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(full)] || 'application/octet-stream' });
  fs.createReadStream(full).pipe(res);
}).listen(port, () => console.log('May chu Con Kien: http://127.0.0.1:' + port));