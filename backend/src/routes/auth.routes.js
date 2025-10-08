// backend/src/routes/auth.routes.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { ObjectId } = require('mongodb');

const validate = require('../middlewares/validate');
const checkAuth = require('../middlewares/authRequired');
const { registerFullSchema, loginSchema } = require('../validation/auth.schema');

// Prefer using centralized collection access:
const { collections } = require('../db/collections');

console.log('[auth.routes] loaded');
router.get('/_ping', (_req, res) => res.json({ ok: true, scope: 'auth' }));

/**
 * reCAPTCHA verification middleware.
 * - In development: skips verification.
 * - Accepts either v3 `recaptchaToken` or v2 `g-recaptcha-response`.
 */
async function verifyRecaptcha(req, res, next) {
  try {
    if (process.env.NODE_ENV === 'development') {
      req.recaptcha = { skipped: true };
      return next();
    }

    // Support both v2 and v3 field names
    const token =
      req.validated?.recaptchaToken ||
      req.validated?.['g-recaptcha-response'] ||
      req.body?.recaptchaToken ||
      req.body?.['g-recaptcha-response'];

    if (!token) return res.status(400).json({ error: 'recaptcha_token_missing' });

    const secret = process.env.RECAPTCHA_SECRET;
    if (!secret) {
      // Fail closed in non-dev if secret missing
      return res.status(500).json({ error: 'recaptcha_not_configured' });
    }

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await r.json();
    if (!data.success) {
      return res.status(400).json({ error: 'recaptcha_failed', details: data['error-codes'] || [] });
    }

    // Optional: if using v3 scoring
    const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || '0');
    if (typeof data.score === 'number' && minScore > 0 && data.score < minScore) {
      return res.status(400).json({ error: 'recaptcha_score_low', score: data.score });
    }

    req.recaptcha = { ok: true, data };
    return next();
  } catch (_err) {
    // Avoid leaking details
    return res.status(500).json({ error: 'recaptcha_error' });
  }
}

// --- Rate limiters ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_login_attempts' },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /auth/register-full
 * Body: { fullName, idNumber, accountNumber, email, password, confirmPassword, recaptchaToken | g-recaptcha-response }
 * Creates user + initial account, returns { user, account, token }.
 */
router.post(
  '/register-full',
  registerLimiter,
  validate(registerFullSchema),
  verifyRecaptcha,
  async (req, res) => {
    const { fullName, idNumber, accountNumber, email, password } = req.validated;
    const { users, accounts } = collections();
    const now = new Date();
    const emailLc = email.toLowerCase();

    try {
      // Pre-checks: email, idNumber, accountNumber uniqueness
      const [byEmail, byId, accountTaken] = await Promise.all([
        users.findOne({ email: emailLc }),
        users.findOne({ idNumber }),
        accounts.findOne({ number: accountNumber }),
      ]);

      if (byEmail) return res.status(409).json({ error: 'email_exists' });
      if (byId) return res.status(409).json({ error: 'idnumber_exists' });
      if (accountTaken) return res.status(409).json({ error: 'account_number_exists' });

      // Create user
      const passwordHash = await bcrypt.hash(password, 12);
      const userDoc = {
        name: fullName,
        email: emailLc,
        idNumber,
        role: 'user',
        passwordHash,
        createdAt: now,
        updatedAt: now,
      };
      const userInsert = await users.insertOne(userDoc);
      const userId = userInsert.insertedId;

      // Create initial account (Primary)
      const accountDoc = {
        userId: new ObjectId(userId),
        name: 'Primary',
        type: 'checking', // UI can change later
        currency: 'ZAR',
        number: accountNumber,
        balanceCents: 0, // store as cents to avoid FP issues
        note: null,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
      const accInsert = await accounts.insertOne(accountDoc);

      // Issue JWT
      const claims = { id: userId.toString(), name: fullName, role: 'user' };
      const token = jwt.sign(claims, process.env.JWT_SECRET, { expiresIn: '6h' });

      // Response shape
      return res.status(201).json({
        user: {
          id: userId.toString(),
          name: fullName,
          email: emailLc,
          idNumber,
          role: 'user',
        },
        account: {
          id: accInsert.insertedId.toString(),
          number: accountDoc.number,
          name: accountDoc.name,
          type: accountDoc.type,
          currency: accountDoc.currency,
          balance: 0,
          archived: false,
          createdAt: accountDoc.createdAt,
          updatedAt: accountDoc.updatedAt,
        },
        token,
      });
    } catch (err) {
      if (err?.code === 11000) {
        // Handle unique index races
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        return res.status(409).json({ error: `duplicate_${field}` });
      }
      req.log?.error({ err }, 'auth_register_full_error');
      return res.status(500).json({ error: 'registration_failed' });
    }
  }
);

/**
 * POST /auth/login
 * Body: { accountNumber, idNumber, password, recaptchaToken | g-recaptcha-response }
 * Finds account -> user, checks password, returns { user, account, token }.
 */
router.post('/login', loginLimiter, validate(loginSchema), verifyRecaptcha, async (req, res) => {
  const { accountNumber, idNumber, password } = req.validated;
  const { users, accounts } = collections();

  try {
    req.log?.info({ accountNumber }, 'auth_login_attempt');

    // 1) Find account by number
    const account = await accounts.findOne({ number: accountNumber });
    if (!account) {
      req.log?.warn({ accountNumber }, 'auth_login_account_not_found');
      return res.status(404).json({ error: 'account_not_found' });
    }

    // 2) Find user by account.userId + confirm idNumber matches
    const ownerId = typeof account.userId === 'string' ? new ObjectId(account.userId) : account.userId;
    const user = await users.findOne({ _id: ownerId, idNumber });
    if (!user) {
      req.log?.warn({ accountNumber }, 'auth_login_invalid_id_number');
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    // 3) Check password
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) {
      req.log?.warn({ userId: user._id.toString() }, 'auth_login_bad_password');
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    // 4) JWT
    const claims = { id: user._id.toString(), name: user.name, role: user.role || 'user' };
    const token = jwt.sign(claims, process.env.JWT_SECRET, { expiresIn: '6h' });

    // 5) Shape response (frontend can fetch more via /accounts)
    const balance =
      typeof account.balanceCents === 'number' ? account.balanceCents / 100 : account.balance ?? null;

    const out = {
      message: 'login_ok',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email || null,
        idNumber: user.idNumber,
        role: user.role || 'user',
      },
      account: {
        id: account._id?.toString?.() || undefined,
        number: account.number,
        type: account.type || 'checking',
        currency: account.currency || 'ZAR',
        balance,
      },
      token,
    };

    req.log?.info({ userId: user._id.toString() }, 'auth_login_success');
    return res.status(200).json(out);
  } catch (err) {
    req.log?.error({ err }, 'auth_login_error');
    return res.status(500).json({ error: 'login_failed' });
  }
});

router.get('/me', checkAuth, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
