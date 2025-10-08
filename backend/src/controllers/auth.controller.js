// backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { collections } = require('../db/collections');

function toStringId(id) {
  try { return new ObjectId(id); } catch { return null; }
}

async function loginUser(req, res) {
  const { accountNumber, idNumber, password } = req.validated;
  const { users, accounts } = collections();

  // Log the attempt (pino via pino-http)
  req.log.info({ accountNumber }, 'auth_login_attempt');

  // 1) Find the account by number
  const account = await accounts.findOne({ number: accountNumber });
  if (!account) {
    req.log.warn({ accountNumber }, 'auth_login_account_not_found');
    return res.status(404).json({ error: 'account_not_found' });
  }

  // 2) Resolve user by account.userId (+ ensure ID number matches)
  const idObj = typeof account.userId === 'string' ? toStringId(account.userId) : account.userId;
  const user = await users.findOne({ _id: idObj, idNumber });
  if (!user) {
    req.log.warn({ accountNumber }, 'auth_login_invalid_id_number');
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  // 3) Password check
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) {
    req.log.warn({ userId: user._id.toString() }, 'auth_login_bad_password');
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  // 4) Issue JWT
  const token = jwt.sign(
    { id: user._id.toString(), name: user.name, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '6h' }
  );

  // Optional: project a minimal user payload
  const summary = {
    id: user._id.toString(),
    name: user.name,
    email: user.email || null,
    idNumber: user.idNumber,
  };

  // 5) Current main account balance for convenience (useful for dashboard)
  const balance = typeof account.balanceCents === 'number' ? account.balanceCents / 100 : null;

  req.log.info({ userId: user._id.toString() }, 'auth_login_success');
  return res.status(200).json({
    message: 'login_ok',
    user: summary,
    account: { number: account.number, type: account.type, currency: account.currency, balance },
    token
  });
}

module.exports = { loginUser };
