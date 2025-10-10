// backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { collections } = require('../db/collections');

function toStringId(id) {
  try { return new ObjectId(id); } catch { return null; }
}

async function registerFullUser(req, res) {
  const { fullName, idNumber, accountNumber, email, password } = req.validated;
  const { users, accounts } = collections();

  req.log.info({ email, accountNumber }, 'auth_register_attempt');

  // Uniqueness checks
  const [uByEmail, uById, accByNumber] = await Promise.all([
    users.findOne({ email }),
    users.findOne({ idNumber }),
    accounts.findOne({ number: accountNumber }),
  ]);

  if (uByEmail) return res.status(409).json({ error: 'email_exists' });
  if (uById) return res.status(409).json({ error: 'id_exists' });
  if (accByNumber) return res.status(409).json({ error: 'account_exists' });

  // Create user
  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  const userDoc = {
    name: fullName,
    idNumber,
    email,
    passwordHash,
    role: 'user',
    createdAt: now,
    updatedAt: now,
  };

  const userResult = await users.insertOne(userDoc);
  const userId = userResult.insertedId;

  // Create account
  const accountDoc = {
    number: accountNumber,
    userId,
    type: 'personal',
    currency: 'ZAR',
    balanceCents: 0,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  await accounts.insertOne(accountDoc);

  // Issue JWT
  const token = jwt.sign(
    { id: userId.toString(), name: fullName, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '6h' }
  );

  req.log.info({ userId: userId.toString() }, 'auth_register_success');

  return res.status(201).json({
    message: 'account_created',
    token,
    user: { id: userId.toString(), name: fullName, email, idNumber },
    account: { number: accountDoc.number, type: accountDoc.type, currency: accountDoc.currency, balance: 0 },
  });
}

async function loginUser(req, res) {
  const { accountNumber, idNumber, password } = req.validated;
  const { users, accounts } = collections();

  req.log.info({ accountNumber }, 'auth_login_attempt');

  const account = await accounts.findOne({ number: accountNumber });
  if (!account) {
    req.log.warn({ accountNumber }, 'auth_login_account_not_found');
    return res.status(404).json({ error: 'account_not_found' });
  }

  const idObj = typeof account.userId === 'string' ? toStringId(account.userId) : account.userId;
  const user = await users.findOne({ _id: idObj, idNumber });
  if (!user) {
    req.log.warn({ accountNumber }, 'auth_login_invalid_id_number');
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) {
    req.log.warn({ userId: user._id.toString() }, 'auth_login_bad_password');
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const token = jwt.sign(
    { id: user._id.toString(), name: user.name, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '6h' }
  );

  const summary = {
    id: user._id.toString(),
    name: user.name,
    email: user.email || null,
    idNumber: user.idNumber,
  };

  const balance = typeof account.balanceCents === 'number' ? account.balanceCents / 100 : null;

  req.log.info({ userId: user._id.toString() }, 'auth_login_success');
  return res.status(200).json({
    message: 'login_ok',
    user: summary,
    account: { number: account.number, type: account.type, currency: account.currency, balance },
    token
  });
}

module.exports = { loginUser, registerFullUser };
