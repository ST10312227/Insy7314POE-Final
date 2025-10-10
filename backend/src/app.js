// backend/src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const hpp = require('hpp');
const sanitize = require('mongo-sanitize');       // NoSQL operator scrub (body/params only)
const { filterXSS } = require('xss');             // Express-5–safe XSS cleaning (body/params only)

const pino = require('pino');
const pinoHttp = require('pino-http');

const app = express();

// ---------------- Security headers (Helmet – hardened) ----------------
const IS_PROD = (process.env.NODE_ENV || 'development') === 'production';
const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'none'"],
      "base-uri": ["'none'"],
      "frame-ancestors": ["'none'"],
      "connect-src": [FRONTEND, "https://localhost:*", "http://localhost:*"],
      "img-src": ["'self'", "data:"],
      "form-action": [FRONTEND],
      "object-src": ["'none'"],
      "script-src": ["'self'"],
      "style-src": ["'self'"],
    },
  },
  hsts: IS_PROD ? { maxAge: 15552000, includeSubDomains: true, preload: false } : false,
  referrerPolicy: { policy: "no-referrer" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: false,
}));

// ---------------- CORS ----------------
app.use(cors({
  origin: FRONTEND,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// ---------------- Body parsers ----------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ---------------- Input Hardening (Express 5–safe) ----------------
// 1) NoSQL injection guard: sanitize body & params only (do NOT touch req.query)
app.use((req, _res, next) => {
  if (req.body)   req.body   = sanitize(req.body,   { replaceWith: '_' });
  if (req.params) req.params = sanitize(req.params, { replaceWith: '_' });
  next();
});

// 2) XSS cleaning: recursively clean strings in body & params (do NOT touch req.query)
function cleanStrings(value) {
  if (typeof value === 'string') {
    // Remove all tags; block script bodies
    return filterXSS(value, {
      whiteList: {}, // disallow all tags
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style', 'iframe'],
    });
  } else if (Array.isArray(value)) {
    return value.map(cleanStrings);
  } else if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = cleanStrings(value[k]);
    return out;
  }
  return value;
}
app.use((req, _res, next) => {
  if (req.body)   req.body   = cleanStrings(req.body);
  if (req.params) req.params = cleanStrings(req.params);
  // NOTE: Do NOT mutate req.query (getter-only in Express 5). Queries are validated in schemas.
  next();
});

// 3) HTTP Parameter Pollution guard
app.use(hpp({ whitelist: ['days', 'txLimit', 'limit', 'cursor', 'archived'] }));

// ---------------- Health check ----------------
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// ---------------- Logging ----------------
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(pinoHttp({ logger, redact: ['req.headers.authorization', 'req.headers.cookie'] }));

app.use((req, res, next) => {
  req.log.info({ method: req.method, path: req.path }, 'request_start');
  res.on('finish', () => req.log.info({ status: res.statusCode }, 'request_end'));
  next();
});

// ---------------- DB migration at startup (code-based) ----------------
const { getDb } = require('./db/mongo');
const { runBeneficiariesMigration } = require('./migrations/beneficiaries-numberNorm.migration');

// Kick off migration once the DB is reachable.
// This runs in the background; if you want fail-fast on migration error, handle the throw accordingly.
(async () => {
  try {
    // Ensure a connection is established (adapt if you have an explicit connect() function)
    const db = getDb();
    logger.info({ db: db?.databaseName }, 'mongo_connected');

    await runBeneficiariesMigration(logger);
    logger.info('beneficiaries_migration_completed');
  } catch (e) {
    logger.error({ err: e?.message }, 'beneficiaries_migration_failed');
    // Optional: crash the process if you require the unique index to exist
    // process.exit(1);
  }
})();

// ---------------- Routers ----------------
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const paymentsRoutes = require('./routes/payments.routes');
app.use('/payments', paymentsRoutes);

const accountsRoutes = require('./routes/accounts.routes');
app.use('/accounts', accountsRoutes);

const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/dashboard', dashboardRoutes);

const transfersRoutes = require('./routes/transfers.routes');
app.use('/payments/transfers', transfersRoutes);

const beneficiariesRoutes = require('./routes/beneficiaries.routes');
app.use('/payments/beneficiaries', beneficiariesRoutes);

const internationalRoutes = require('./routes/international.routes');
app.use('/payments/international', internationalRoutes);


// ⬇️ FIXED: don’t mount two different routers on the same path
const internationalbeneficiariesRoutes = require('./routes/internationalbeneficiaries.routes');
app.use('/payments/international-beneficiaries', internationalbeneficiariesRoutes);

const localTransfersRoutes = require('./routes/localTransfers.routes');
app.use('/payments/local', localTransfersRoutes);


// ---------------- DB ping ----------------
app.get('/db/ping', async (_req, res) => {
  try {
    const db = getDb();
    await db.command({ ping: 1 });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------------- Export app ----------------
module.exports = app;
