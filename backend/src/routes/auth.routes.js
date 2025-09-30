const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const validate = require('../middlewares/validate');
const checkAuth = require('../middlewares/authRequired');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');
const { usersCol } = require('../models/users');

console.log('[auth.routes] loaded');
router.get('/_ping', (_req, res) => res.json({ ok: true, scope: 'auth' }));


// --- Login rate limiter (works with Express 5) ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // allow 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

// (Optional) light limiter on register as well
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.validated;
  const col = await usersCol();

  const existing = await col.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await col.insertOne({
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date(),
  });

  const user = { id: result.insertedId.toString(), name, email: email.toLowerCase() };
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({ user, token });
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.validated;
  const col = await usersCol();

  const user = await col.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const out = { id: user._id.toString(), name: user.name, email: user.email };
  const token = jwt.sign(out, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ user: out, token });
});

router.get('/me', checkAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
