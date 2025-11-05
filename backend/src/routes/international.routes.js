// backend/src/routes/international.routes.js
const router = require('express').Router();
const { ObjectId } = require('mongodb');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const checkAuth = require('../middlewares/authRequired');
const validate = require('../middlewares/validate');
const { collections } = require('../db/collections');

// ---------- validators ----------
const WHO = z.enum(['Person', 'Business']);
const CURRENCIES = z.enum(['USD', 'EUR', 'CNY', 'ZAR', 'GBP']).optional(); // extend as needed

const createIntlBeneficiarySchema = z.object({
  who: WHO,
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  address: z.string().trim().min(2).max(160),
  cityName: z.string().trim().min(1).max(80),
  country: z.string().trim().min(2).max(80),

  bank: z.string().trim().min(2).max(120),
  accountNumber: z.string().trim().min(4).max(64),
  swiftCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{8}([A-Z0-9]{3})?$/, 'swiftCode must be 8 or 11 chars'),

  // optional defaults you capture in UI
  currency: CURRENCIES,
  reference: z.string().trim().max(140).optional(),
});

const createIntlTransferSchema = z.object({
  beneficiaryId: z.string().trim().length(24, 'invalid beneficiaryId'),
  amount: z.number().positive(),
  currency: z.string().trim().min(3).max(3),
  reference: z.string().trim().max(140).optional(),
});

// ---------- rate limit writes ----------
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------- indexes (ensure once on boot) ----------
(async () => {
  try {
    const { internationalBeneficiaries, internationalTransfers } = collections();

    // unique per user: (country + account + swift)
    await internationalBeneficiaries.createIndex(
      { userId: 1, country: 1, accountNumber: 1, swiftCode: 1 },
      { unique: true, name: 'uniq_user_country_account_swift' }
    );

    await internationalBeneficiaries.createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'user_createdAt' }
    );

    await internationalTransfers.createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'transfers_user_createdAt' }
    );

    await internationalTransfers.createIndex(
      { status: 1, createdAt: -1 },
      { name: 'transfers_status_createdAt' }
    );
  } catch (_err) {
    // ignore on boot
  }
})();

// ---------- routes ----------

// quick ping
router.get('/_ping', (_req, res) => res.json({ ok: true, scope: 'international' }));

// GET /payments/international/beneficiaries
router.get('/beneficiaries', checkAuth, async (req, res) => {
  const { internationalBeneficiaries } = collections();
  const userId = new ObjectId(req.user.id);

  const list = await internationalBeneficiaries
    .find({ userId, archived: { $ne: true } })
    .project({ userId: 0 })
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ items: list });
});

// POST /payments/international/beneficiaries
router.post(
  '/beneficiaries',
  checkAuth,
  writeLimiter,
  validate(createIntlBeneficiarySchema),
  async (req, res) => {
    const { internationalBeneficiaries } = collections();
    const now = new Date();

    const doc = {
      userId: new ObjectId(req.user.id),
      ...req.validated,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const r = await internationalBeneficiaries.insertOne(doc);
      res.status(201).json({ id: r.insertedId.toString(), ...doc });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ error: 'beneficiary_exists' });
      }
      req.log?.error({ err }, 'intl_beneficiary_create_error');
      res.status(500).json({ error: 'create_failed' });
    }
  }
);

// POST /payments/international/transfers
// Always creates a transfer with status = "Pending"
router.post(
  '/transfers',
  checkAuth,
  writeLimiter,
  validate(createIntlTransferSchema),
  async (req, res) => {
    const { internationalTransfers, internationalBeneficiaries } = collections();
    const userId = new ObjectId(req.user.id);

    // ensure beneficiary belongs to logged-in user
    const bId = new ObjectId(req.validated.beneficiaryId);
    const b = await internationalBeneficiaries.findOne({ _id: bId, userId });
    if (!b) return res.status(404).json({ error: 'beneficiary_not_found' });

    const now = new Date();
    const tx = {
      userId,
      beneficiaryId: bId,

      amount: req.validated.amount,
      currency: (req.validated.currency || '').toUpperCase(),
      reference: req.validated.reference || null,

      // snapshot some beneficiary fields for auditing
      beneficiary: {
        name: b.name || `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim(),
        firstName: b.firstName ?? null,
        lastName: b.lastName ?? null,
        accountNumber: b.accountNumber || '',
        swiftCode: b.swiftCode || '',
        bank: b.bank || '',
        address: b.address || '',
        cityName: b.cityName || '',
        country: b.country || '',
      },

      // workflow
      status: 'Pending',         // <— requested change
      verifiedAt: null,
      verifiedBy: null,
      archived: false,

      createdAt: now,
      updatedAt: now,
    };

    const r = await internationalTransfers.insertOne(tx);
    res.status(201).json({ id: r.insertedId.toString(), ...tx });
  }
);

module.exports = router;
