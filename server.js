const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT     = 3737;
const DATA_FILE = path.join(__dirname, 'data.json');
const HTML_FILE = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // ── CORS headers (allow local dev) ──────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── GET /api/spy-price ───────────────────────────────────────
  if (method === 'GET' && url === '/api/spy-price') {
    const options = {
      hostname: 'query1.finance.yahoo.com',
      path: '/v8/finance/chart/SPY?interval=1d&range=1d',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    };
    const req = https.get(options, apiRes => {
      let body = '';
      apiRes.on('data', chunk => body += chunk);
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const meta   = parsed.chart.result[0].meta;
          const price  = meta.regularMarketPrice;
          const prev   = meta.chartPreviousClose;
          const change = price - prev;
          const changePct = (change / prev) * 100;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ price, prev, change, changePct, symbol: 'SPY', timestamp: Date.now() }));
        } catch (e) {
          res.writeHead(500); res.end(JSON.stringify({ error: 'Parse error', raw: body.slice(0, 200) }));
        }
      });
    });
    req.on('error', e => {
      res.writeHead(502); res.end(JSON.stringify({ error: e.message }));
    });
    req.setTimeout(8000, () => {
      req.destroy();
      res.writeHead(504); res.end(JSON.stringify({ error: 'Timeout fetching SPY' }));
    });
    return;
  }

  // ── GET /api/data ────────────────────────────────────────────
  if (method === 'GET' && url === '/api/data') {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (e) {
      res.writeHead(500); res.end(JSON.stringify({ error: 'Could not read data.json' }));
    }
    return;
  }

  // ── POST /api/data ───────────────────────────────────────────
  if (method === 'POST' && url === '/api/data') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        JSON.parse(body); // validate
        fs.writeFileSync(DATA_FILE, JSON.stringify(JSON.parse(body), null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // ── Serve index.html ─────────────────────────────────────────
  if (method === 'GET' && (url === '/' || url === '/index.html')) {
    try {
      const html = fs.readFileSync(HTML_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (e) {
      res.writeHead(500); res.end('Could not read index.html');
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n🟢  Portfolio Tracker running at http://localhost:${PORT}\n`);
});
