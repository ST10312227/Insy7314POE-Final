const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
require('dotenv').config();

const app = require('./app');
const { initMongo } = require('./db/mongo');

const PORT_HTTP = Number(process.env.PORT_HTTP) || 3080;
const PORT_HTTPS = Number(process.env.PORT_HTTPS) || 3443;

// TLS files created earlier with OpenSSL
const keyPath = path.resolve('keys', 'privatekey.pem');
const certPath = path.resolve('keys', 'certificate.pem');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('Missing TLS key/cert. Expected files:');
  console.error('   ', keyPath);
  console.error('   ', certPath);
  process.exit(1);
}

// Simple health check (no auth)
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});


async function start() {
  // 1) Connect to Mongo first
  await initMongo();

  // 2) Start HTTPS server
  https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, app)
    .listen(PORT_HTTPS, () => {
      console.log(`HTTPS API listening on https://localhost:${PORT_HTTPS}`);
    });

  // 3) Tiny HTTP→HTTPS redirect server
  http.createServer((req, res) => {
    const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
    res.writeHead(301, { Location: `https://${host}:${PORT_HTTPS}${req.url}` });
    res.end();
  }).listen(PORT_HTTP, () => {
    console.log(`HTTP redirect server on http://localhost:${PORT_HTTP} -> HTTPS`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
