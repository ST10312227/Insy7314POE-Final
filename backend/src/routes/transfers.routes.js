// src/routes/transfers.routes.js
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { ObjectId } = require('mongodb');

const validate = require('../middlewares/validate');
const checkAuth = require('../middlewares/authRequired');
const { accountsCol } = require('../models/accounts');
const { transfersCol } = require('../models/transfers');
const { beneficiariesCol } = require('../models/beneficiaries');
const { transferSchema, quoteSchema } = require('../schemas/transfer.schema');

// ---- Limit creation attempts ----
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests' },
});

// ---- Helpers ----
function calculateFees(kind, amountCents) {
  switch (kind) {
    case 'SAME_BANK': return Math.min(1000, Math.floor(amountCents * 0.002)); // max R10, 0.2%
    case 'LOCAL':     return 1500 + Math.floor(amountCents * 0.003);          // R15 + 0.3%
    case 'INTERNATIONAL': return 7500 + Math.floor(amountCents * 0.005);      // R75 + 0.5%
    default: return 0;
  }
}

const FX = { 'ZAR->USD': 0.055, 'ZAR->EUR': 0.051, 'ZAR->GBP': 0.043 };
function getFxRate(from, to) {
  if (from.toUpperCase() === to.toUpperCase()) return 1;
  return FX[`${from.toUpperCase()}->${to.toUpperCase()}`] || null;
}

// ---- Routes ----
router.get('/_ping', checkAuth, (_req, res) => res.json({ ok: true, scope: 'transfers' }));

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

router.post('/', checkAuth, createLimiter, validate(transferSchema), async (req, res) => {
  const payload = req.validated;
  const userId = new ObjectId(req.user.id);
  const now = new Date();

  const idem = payload.idempotencyKey || req.header('Idempotency-Key') || null;
  const feesCents = calculateFees(payload.type, payload.amountCents);

  // Resolve international beneficiary if provided by id
  let intlBeneficiary = null;
  if (payload.type === 'INTERNATIONAL' && payload.beneficiaryId) {
    const bcol = await beneficiariesCol();
    intlBeneficiary = await bcol.findOne({
      _id: new ObjectId(payload.beneficiaryId),
      userId,
      kind: 'INTERNATIONAL',
      archived: { $ne: true }
    });
    if (!intlBeneficiary) return res.status(404).json({ error: 'beneficiary_not_found' });
  }

  // FX handling for international
  let fx = null;
  if (payload.type === 'INTERNATIONAL') {
    const toCurr = payload.fxTargetCurrency;
    const fromCurr = payload.currency;
    const rate = getFxRate(fromCurr, toCurr);
    if (!rate) return res.status(422).json({ error: 'unsupported_fx_pair' });
    fx = {
      rate,
      to: toCurr.toUpperCase(),
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

  // Build beneficiary object to store on transfer
  const beneficiary = (() => {
    if (payload.type === 'INTERNATIONAL') {
      if (intlBeneficiary) {
        const b = intlBeneficiary;
        return {
          name: b.who === 'PERSON' ? `${b.firstName} ${b.lastName}`.trim() : b.businessName,
          country: b.country.toUpperCase(),
          bankName: b.bankName,
          iban: b.accountNumber,
          swiftBic: b.swiftBic
        };
      } else {
        return {
          name: payload.beneficiaryName,
          country: payload.destinationCountry.toUpperCase(),
          iban: payload.iban,
          swiftBic: payload.swiftBic
        };
      }
    }
    if (payload.type === 'SAME_BANK') {
      return { name: payload.beneficiaryName, accountNumber: payload.beneficiaryAccount, bank: 'VAULT' };
    }
    // LOCAL
    return { name: payload.beneficiaryName, accountNumber: payload.beneficiaryAccount, branchCode: payload.branchCode };
  })();

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
    beneficiary,
    scheduleAt: payload.scheduleAt || null,
    status: payload.type === 'INTERNATIONAL' ? 'PENDING_SWIFT' : 'POSTED',
    postedAt: now,
    createdAt: now,
    idempotencyKey: idem,
    audit: [{ at: now, action: 'CREATE', by: userId }],
  };

  try {
    const ins = await transfers.insertOne(doc);
    return res.status(201).json({ id: ins.insertedId.toString(), ...doc });
  } catch (e) {
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

router.get('/', checkAuth, async (req, res) => {
  const col = await transfersCol();
  const rows = await col.find({ userId: new ObjectId(req.user.id) }).sort({ createdAt: -1 }).limit(100).toArray();
  res.json(rows.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest })));
});

router.get('/:id', checkAuth, async (req, res) => {
  const col = await transfersCol();
  const row = await col.findOne({ _id: new ObjectId(req.params.id), userId: new ObjectId(req.user.id) });
  if (!row) return res.status(404).json({ error: 'not_found' });
  const { _id, ...rest } = row;
  res.json({ id: _id.toString(), ...rest });
});

module.exports = router;
