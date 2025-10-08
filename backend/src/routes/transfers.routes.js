// src/routes/transfers.routes.js
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { ObjectId } = require('mongodb');

const validate = require('../middlewares/validate');
const checkAuth = require('../middlewares/authRequired');
const { accountsCol } = require('../models/accounts');
const { transfersCol } = require('../models/transfers');
const {
  transferSchema,
  quoteSchema,
} = require('../schemas/transfer.schema');

// ---- Limit creation attempts ----
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests' },
});

// ---- Helpers ----

// very rough fee table and FX rate source for demo purposes
function calculateFees(kind, amountCents) {
  // Flat + percentage (illustrative only)
  switch (kind) {
    case 'SAME_BANK': return Math.min(1000, Math.floor(amountCents * 0.002)); // max R10, 0.2%
    case 'LOCAL':     return 1500 + Math.floor(amountCents * 0.003);          // R15 + 0.3%
    case 'INTERNATIONAL': return 7500 + Math.floor(amountCents * 0.005);      // R75 + 0.5%
    default: return 0;
  }
}

// simple fx table (source currency -> target)
const FX = {
  // ZAR to others
  'ZAR->USD': 0.055,
  'ZAR->EUR': 0.051,
  'ZAR->GBP': 0.043,
};

function getFxRate(from, to) {
  if (from.toUpperCase() === to.toUpperCase()) return 1;
  const key = `${from.toUpperCase()}->${to.toUpperCase()}`;
  return FX[key] || null;
}

// ---- Routes ----

// health
router.get('/_ping', checkAuth, (_req, res) => res.json({ ok: true, scope: 'transfers' }));

// Quote endpoint the UI can call to preview fees & fx
router.post('/quote', checkAuth, validate(quoteSchema), async (req, res) => {
  const { kind, amountCents, currency, fxTargetCurrency } = req.validated;
  const feesCents = calculateFees(kind, amountCents);
  let fxRate = 1, convertedCents = amountCents, target = currency;
  if (kind === 'INTERNATIONAL') {
    if (!fxTargetCurrency) return res.status(400).json({ error: 'fxTargetCurrency_required' });
    fxRate = getFxRate(currency, fxTargetCurrency);
    if (!fxRate) return res.status(422).json({ error: 'unsupported_fx_pair' });
    convertedCents = Math.floor(amountCents * fxRate);
    target = fxTargetCurrency;
  }
  res.json({ kind, amountCents, currency, feesCents, fxRate, convertedCents, targetCurrency: target });
});

// Create a transfer (LOCAL/SAME_BANK/INTERNATIONAL)
router.post('/', checkAuth, createLimiter, validate(transferSchema), async (req, res) => {
  const payload = req.validated;
  const userId = new ObjectId(req.user.id);
  const now = new Date();

  // pull idempotency key from header if not in body
  const idem = payload.idempotencyKey || req.header('Idempotency-Key') || null;

  // compute fees and (if intl) fx
  const feesCents = calculateFees(payload.type, payload.amountCents);

  let fx = null;
  if (payload.type === 'INTERNATIONAL') {
    const rate = getFxRate(payload.currency, payload.fxTargetCurrency);
    if (!rate) return res.status(422).json({ error: 'unsupported_fx_pair' });
    fx = {
      rate,
      to: payload.fxTargetCurrency.toUpperCase(),
      convertedCents: Math.floor(payload.amountCents * rate),
    };
  }

  // debit source account atomically if enough funds
  const accounts = await accountsCol();
  const totalDebit = payload.amountCents + feesCents;

  const accRes = await accounts.updateOne(
    { userId, accountNumber: payload.sourceAccount, balanceCents: { $gte: totalDebit }, archived: { $ne: true } },
    { $inc: { balanceCents: -totalDebit }, $setOnInsert: { createdAt: now } },
    { upsert: false }
  );

  if (accRes.matchedCount === 0 || accRes.modifiedCount === 0) {
    return res.status(400).json({ error: 'insufficient_funds_or_account_not_found' });
  }

  // insert transfer (idempotent)
  const transfers = await transfersCol();
  const doc = {
    userId,
    type: payload.type,
    amountCents: payload.amountCents,
    currency: payload.currency.toUpperCase(),
    sourceAccount: payload.sourceAccount,
    reference: payload.reference,
    feesCents,
    fx,
    beneficiary: (() => {
      switch (payload.type) {
        case 'SAME_BANK':
          return { name: payload.beneficiaryName, accountNumber: payload.beneficiaryAccount, bank: 'VAULT' };
        case 'LOCAL':
          return { name: payload.beneficiaryName, accountNumber: payload.beneficiaryAccount, branchCode: payload.branchCode };
        case 'INTERNATIONAL':
          return { name: payload.beneficiaryName, iban: payload.iban, swiftBic: payload.swiftBic, country: payload.destinationCountry.toUpperCase() };
      }
    })(),
    scheduleAt: payload.scheduleAt || null,
    status: 'POSTED',           // immediate posting for demo
    postedAt: now,
    createdAt: now,
    idempotencyKey: idem,
    audit: [{ at: now, action: 'CREATE', by: userId }],
  };

  try {
    const ins = await transfers.insertOne(doc);
    return res.status(201).json({ id: ins.insertedId.toString(), ...doc });
  } catch (e) {
    // idempotency duplicate — fetch and return existing
    if (e && e.code === 11000 && idem) {
      const existing = await transfers.findOne({ userId, idempotencyKey: idem });
      return res.status(201).json({ id: existing._id.toString(), ...existing });
    }
    // rollback debit on failure
    await accounts.updateOne(
      { userId, accountNumber: payload.sourceAccount },
      { $inc: { balanceCents: totalDebit } }
    );
    throw e;
  }
});

// List my transfers (newest first)
router.get('/', checkAuth, async (req, res) => {
  const transfers = await transfersCol();
  const rows = await transfers
    .find({ userId: new ObjectId(req.user.id) })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const out = rows.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
  res.json(out);
});

// Get a single transfer
router.get('/:id', checkAuth, async (req, res) => {
  const transfers = await transfersCol();
  const row = await transfers.findOne({ _id: new ObjectId(req.params.id), userId: new ObjectId(req.user.id) });
  if (!row) return res.status(404).json({ error: 'not_found' });
  const { _id, ...rest } = row;
  res.json({ id: _id.toString(), ...rest });
});

module.exports = router;
