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

  // Optional source account existence check
  const acol = await accountsCol();
  const source = await acol.findOne({ number: payload.sourceAccount, userId: userId.toString(), status: 'ACTIVE' });
  if (!source) return res.status(404).json({ error: 'source_account_not_found' });

  // Build FX object only for international
  const fx = (payload.type === 'INTERNATIONAL')
    ? (() => {
        const rate = getFxRate(payload.currency, payload.fxTargetCurrency);
        if (!rate) return null;
        const convertedCents = Math.floor(payload.amountCents * rate);
        return { rate, from: payload.currency, to: payload.fxTargetCurrency, convertedCents };
      })()
    : null;

  // Beneficiary block
  const beneficiary = (() => {
    if (payload.type === 'INTERNATIONAL') {
      if (intlBeneficiary) {
        const b = intlBeneficiary;
        return {
          name: b.who === 'PERSON' ? `${b.firstName} ${b.lastName}` : b.businessName,
          country: b.country,
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
    idempotencyKey: idem,
    status: 'PENDING_STAFF_REVIEW',
    createdAt: now,
    updatedAt: now,
  };

  // Idempotency (best-effort)
  if (idem) {
    const existing = await transfers.findOne({ userId, idempotencyKey: idem });
    if (existing) {
      const { _id, ...rest } = existing;
      return res.status(200).json({ id: _id.toString(), ...rest, idempotent: true });
    }
  }

  const ins = await transfers.insertOne(doc);
  res.status(201).json({ id: ins.insertedId.toString(), ...doc });
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
