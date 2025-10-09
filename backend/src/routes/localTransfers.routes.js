const router = require('express').Router();
const { ObjectId } = require('mongodb');
const rateLimit = require('express-rate-limit');
const checkAuth = require('../middlewares/authRequired');
const validate = require('../middlewares/validate');
const { z } = require('zod');
const { collections } = require('../db/collections');

// -------- validation --------
const createLocalBeneficiarySchema = z.object({
  name: z.string().trim().min(2).max(120),
  bank: z.string().trim().min(2).max(80),
  branchCode: z.string().trim().min(3).max(16),
  accountType: z.enum(['Savings', 'Cheque', 'Credit']),
  accountNumber: z.string().trim().regex(/^\d{6,20}$/, 'accountNumber must be 6–20 digits'),
});

const createLocalTransferSchema = z.object({
  name: z.string().trim().min(2).max(120),
  bank: z.string().trim().min(2).max(80),
  branchCode: z.string().trim().min(3).max(16),
  accountType: z.enum(['Savings', 'Cheque', 'Credit']),
  accountNumber: z.string().trim().regex(/^\d{6,20}$/),
  amount: z.coerce.number().positive('amount must be > 0'),
  ownReference: z.string().trim().min(1).max(40),
  recipientReference: z.string().trim().min(1).max(40),
  paymentType: z.enum(['Real-time', 'Proof of Payment']),
});

// -------- ratelimits --------
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// -------- lazy index preparation (SAFE) --------
let indexesPrepared = false;
let preparing = null;

async function prepareIndexes() {
  if (indexesPrepared) return;
  if (preparing) return preparing;            // de-dupe concurrent calls

  preparing = (async () => {
    const { localBeneficiaries, localTransfers } = collections(); // <-- now safe (called after init)
    await localBeneficiaries.createIndex(
      { userId: 1, bank: 1, accountNumber: 1 },
      { unique: true, name: 'uniq_user_bank_acct' }
    );
    await localTransfers.createIndex({ userId: 1, createdAt: -1 }, { name: 'by_user_date' });
    indexesPrepared = true;
  })();

  return preparing;
}

// quick ping
router.get('/_ping', (_req, res) => res.json({ ok: true, scope: 'local-transfers' }));

// -------- beneficiaries --------

// GET /payments/local/beneficiaries
router.get('/beneficiaries', checkAuth, async (req, res) => {
  await prepareIndexes(); // ensure indexes exist, but only after Mongo init
  const { localBeneficiaries } = collections();
  const userId = new ObjectId(req.user.id);
  const list = await localBeneficiaries
    .find({ userId, archived: { $ne: true } })
    .project({ userId: 0 })
    .sort({ createdAt: -1 })
    .toArray();
  res.json({ items: list });
});

// POST /payments/local/beneficiaries
router.post(
  '/beneficiaries',
  checkAuth,
  writeLimiter,
  validate(createLocalBeneficiarySchema),
  async (req, res) => {
    await prepareIndexes();
    const { localBeneficiaries } = collections();
    const userId = new ObjectId(req.user.id);
    const now = new Date();

    const doc = {
      userId,
      ...req.validated,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const r = await localBeneficiaries.insertOne(doc);
      return res.status(201).json({ id: r.insertedId.toString(), ...doc });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ error: 'beneficiary_exists' });
      }
      req.log?.error({ err }, 'local_beneficiary_create_error');
      return res.status(500).json({ error: 'create_failed' });
    }
  }
);

// -------- transfers (payments) --------

// POST /payments/local/transfers
router.post(
  '/transfers',
  checkAuth,
  writeLimiter,
  validate(createLocalTransferSchema),
  async (req, res) => {
    await prepareIndexes();
    const { localTransfers } = collections();
    const userId = new ObjectId(req.user.id);
    const now = new Date();

    const txRef = 'TX-' + Math.floor(100000 + Math.random() * 900000);

    const doc = {
      userId,
      beneficiary: {
        name: req.validated.name,
        bank: req.validated.bank,
        branchCode: req.validated.branchCode,
        accountType: req.validated.accountType,
        accountNumber: req.validated.accountNumber,
      },
      payment: {
        amount: req.validated.amount,
        ownReference: req.validated.ownReference,
        recipientReference: req.validated.recipientReference,
        paymentType: req.validated.paymentType,
      },
      status: 'success',
      reference: txRef,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const r = await localTransfers.insertOne(doc);
      return res.status(201).json({
        id: r.insertedId.toString(),
        reference: txRef,
        date: now,
        status: 'success',
      });
    } catch (err) {
      req.log?.error({ err }, 'local_transfer_create_error');
      return res.status(500).json({ error: 'transfer_failed' });
    }
  }
);

module.exports = router;
