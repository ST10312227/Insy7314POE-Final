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

// ---------------- Env ----------------
const IS_PROD  = (process.env.NODE_ENV || 'development') === 'production';
const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const API_BASE = process.env.API_BASE || '/api';

// ---------------- Security headers (Helmet – hardened) ----------------
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'none'"],
      "base-uri": ["'none'"],
      "frame-ancestors": ["'none'"],
      // Allow the SPA origin (Vite dev) and local loopbacks; include 'self' for same-origin API responses
      "connect-src": ["'self'", FRONTEND, "https://localhost:*", "http://localhost:*"],
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
const corsOptions = {
  origin: FRONTEND,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};
app.use(cors(corsOptions));  // handles preflight automatically

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

// ---------------- Health check (root path) ----------------
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

(async () => {
  try {
    const db = getDb();
    logger.info({ db: db?.databaseName }, 'mongo_connected');
    await runBeneficiariesMigration(logger);
    logger.info('beneficiaries_migration_completed');
  } catch (e) {
    logger.error({ err: e?.message }, 'beneficiaries_migration_failed');
    // Optionally fail fast:
    // process.exit(1);
  }
})();

// ---------------- Routers (mounted under API_BASE) ----------------
const api = express.Router();

// Auth (customer/general)
const authRoutes = require('./routes/auth.routes');
api.use('/auth', authRoutes);

// Employee auth (separate "employees" collection)
const employeeAuthRoutes = require('./routes/auth.employee');
api.use('/auth', employeeAuthRoutes);

// Payments root
const paymentsRoutes = require('./routes/payments.routes');
api.use('/payments', paymentsRoutes);

// Accounts
const accountsRoutes = require('./routes/accounts.routes');
api.use('/accounts', accountsRoutes);

// Dashboard
const dashboardRoutes = require('./routes/dashboard.routes');
api.use('/dashboard', dashboardRoutes);

// Transfers (payments)
const transfersRoutes = require('./routes/transfers.routes');
api.use('/payments/transfers', transfersRoutes);

// Beneficiaries (payments)
const beneficiariesRoutes = require('./routes/beneficiaries.routes');
api.use('/payments/beneficiaries', beneficiariesRoutes);

// International (payments)
const internationalRoutes = require('./routes/international.routes');
api.use('/payments/international', internationalRoutes);

// International beneficiaries
const internationalbeneficiariesRoutes = require('./routes/internationalbeneficiaries.routes');
api.use('/payments/international-beneficiaries', internationalbeneficiariesRoutes);

// Local transfers
const localTransfersRoutes = require('./routes/localTransfers.routes');
api.use('/payments/local', localTransfersRoutes);

// DB ping (under /api for consistency)
api.get('/db/ping', async (_req, res) => {
  try {
    const db = getDb();
    await db.command({ ping: 1 });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Mount the API base
app.use(API_BASE, api);

// ---------------- Export app ----------------
module.exports = app;
