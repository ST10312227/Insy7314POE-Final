const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Security headers
app.use(helmet());

// CORS for your React dev server; credentials will be useful later
const FRONTEND = process.env.FRONTEND_ORIGIN || 'https://localhost:5173';
app.use(cors({
  origin: FRONTEND,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Body + cookies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Basic health check (useful for testing)
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(pinoHttp({ logger, redact: ['req.headers.authorization', 'req.headers.cookie'] }));

// simple start/end logs per request
app.use((req, res, next) => {
  req.log.info({ method: req.method, path: req.path }, 'request_start');
  res.on('finish', () => req.log.info({ status: res.statusCode }, 'request_end'));
  next();
});

const authRoutes = require('./routes/auth.routes');  
app.use('/auth', authRoutes);

const paymentsRoutes = require('./routes/payments.routes');
app.use('/payments', paymentsRoutes);

// --- Accounts routes ---
const accountsRoutes = require('./routes/accounts.routes');
app.use('/accounts', accountsRoutes);



const { getDb } = require('./db/mongo');

app.get('/db/ping', async (_req, res) => {
  try {
    const db = getDb();
    await db.command({ ping: 1 });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});


module.exports = app;
