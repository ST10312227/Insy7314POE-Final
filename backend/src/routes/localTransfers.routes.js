// backend/src/routes/local-transfers.routes.js
const router = require("express").Router();
const { ObjectId } = require("mongodb");
const rateLimit = require("express-rate-limit");
const checkAuth = require("../middlewares/authRequired");
const validate = require("../middlewares/validate");
const { z } = require("zod");
const bcrypt = require("bcryptjs");
const { collections } = require("../db/collections");

// ------------------ validation ------------------
const createLocalBeneficiarySchema = z.object({
  name: z.string().trim().min(2).max(120),
  bank: z.string().trim().min(2).max(80),
  branchCode: z.string().trim().min(3).max(16),
  accountType: z.enum(["Savings", "Cheque", "Credit"]),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, "accountNumber must be 6–20 digits"),
});

const createLocalTransferSchema = z.object({
  // beneficiary (flat, to match your client state)
  name: z.string().trim().min(2).max(120),
  bank: z.string().trim().min(2).max(80),
  branchCode: z.string().trim().min(3).max(16),
  accountType: z.enum(["Savings", "Cheque", "Credit"]),
  accountNumber: z.string().trim().regex(/^\d{6,20}$/),

  // payment
  amount: z.coerce.number().positive("amount must be > 0"),
  ownReference: z.string().trim().min(1).max(40),
  recipientReference: z.string().trim().min(1).max(40),
  paymentType: z.enum(["Real-time", "Proof of Payment"]),

  // vault login password (required)
  password: z.string().min(1, "password required"),
});

// ------------------ rate limits ------------------
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// ------------------ lazy index prep (safe) ------------------
let indexesPrepared = false;
let preparing = null;

async function prepareIndexes() {
  if (indexesPrepared) return;
  if (preparing) return preparing;

  preparing = (async () => {
    const { localBeneficiaries, localTransfers } = collections();
    await localBeneficiaries.createIndex(
      { userId: 1, bank: 1, accountNumber: 1 },
      { unique: true, name: "uniq_user_bank_acct" }
    );
    await localTransfers.createIndex(
      { userId: 1, createdAt: -1 },
      { name: "by_user_date" }
    );
    indexesPrepared = true;
  })();

  return preparing;
}

// quick ping
router.get("/_ping", (_req, res) => res.json({ ok: true, scope: "local-transfers" }));

// ============================================================
// Beneficiaries
// ============================================================

// GET /payments/local/beneficiaries
router.get("/beneficiaries", checkAuth, async (req, res) => {
  await prepareIndexes();
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
  "/beneficiaries",
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
        // same user, same bank + accountNumber
        return res.status(409).json({ error: "beneficiary_exists" });
      }
      req.log?.error({ err }, "local_beneficiary_create_error");
      return res.status(500).json({ error: "create_failed" });
    }
  }
);

// ============================================================
// Transfers (payments)
// ============================================================

// POST /payments/local/transfers  (validates login password)
router.post(
  "/transfers",
  checkAuth,
  writeLimiter,
  validate(createLocalTransferSchema),
  async (req, res) => {
    await prepareIndexes();
    const { users, accounts, localTransfers } = collections();
    const userId = new ObjectId(req.user.id);
    const now = new Date();

    const {
      name,
      bank,
      branchCode,
      accountType,
      accountNumber,
      amount,
      ownReference,
      recipientReference,
      paymentType,
      password,
    } = req.validated;

    try {
      // 1) Validate password against users.passwordHash
      const user = await users.findOne(
        { _id: userId },
        { projection: { passwordHash: 1 } }
      );
      if (!user?.passwordHash) {
        req.log?.warn({ userId: userId.toString() }, "local_tx_no_pwd_hash");
        return res.status(401).json({ error: "invalid_password" });
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        req.log?.warn({ userId: userId.toString() }, "local_tx_bad_password");
        return res.status(401).json({ error: "invalid_password" });
      }

      // 2) (Optional) currency from main account
      const account = await accounts.findOne(
        { userId },
        { projection: { currency: 1 } }
      );

      // 3) Persist transfer
      const txRef = "TX-" + Math.floor(100000 + Math.random() * 900000);

      const doc = {
        userId,
        beneficiary: { name, bank, branchCode, accountType, accountNumber },
        payment: { amount, ownReference, recipientReference, paymentType },
        currency: account?.currency || "ZAR",
        reference: txRef,
        status: "PENDING", // or 'success' if you prefer
        createdAt: now,
        updatedAt: now,
      };

      const r = await localTransfers.insertOne(doc);
      const saved = await localTransfers.findOne({ _id: r.insertedId });

      return res.status(201).json({
        transfer: {
          id: saved._id.toString(),
          reference: saved.reference,
          status: saved.status,
          createdAt: saved.createdAt,
          currency: saved.currency,
          amount: saved.payment.amount,
          paymentType: saved.payment.paymentType,
          beneficiary: saved.beneficiary,
          ownReference: saved.payment.ownReference,
          recipientReference: saved.payment.recipientReference,
        },
      });
    } catch (err) {
      req.log?.error({ err }, "local_transfer_create_error");
      return res.status(500).json({ error: "transfer_failed" });
    }
  }
);

module.exports = router;
