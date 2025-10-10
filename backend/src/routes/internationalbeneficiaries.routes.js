const router = require("express").Router();
const { ObjectId } = require("mongodb");
const rateLimit = require("express-rate-limit");
const checkAuth = require("../middlewares/authRequired");
const validate = require("../middlewares/validate");
const { collections } = require("../db/collections");
const { z } = require("zod");

// ---- validation ----
const createIntlBeneficiarySchema = z.object({
  name: z.string().trim().min(2).max(80),
  // SWIFT/BIC or local bank code; adjust regex/length as needed
  bankCode: z.string().trim().min(2).max(20),
  accountNumber: z.string().trim().min(4).max(34), // IBANs up to 34 chars
  // optional fields
  currency: z.string().trim().min(3).max(3).optional(), // ISO 4217
  note: z.string().trim().max(200).optional(),
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// ---- indexes: unique per user on (bankCode, accountNumber) ----
// partial filter means docs without those string fields won't be considered for uniqueness
(async () => {
  try {
    const { internationalBeneficiaries } = collections();

    // Drop any legacy conflicting unique index (ignore errors)
    try {
      await internationalBeneficiaries.dropIndex("uniq_user_bank_account");
    } catch (_) {}
    try {
      await internationalBeneficiaries.dropIndex({ userId: 1, bankCode: 1, accountNumber: 1 });
    } catch (_) {}

    await internationalBeneficiaries.createIndex(
      { userId: 1, bankCode: 1, accountNumber: 1 },
      {
        name: "uniq_user_bank_account",
        unique: true,
        background: true,
        partialFilterExpression: {
          bankCode: { $type: "string" },
          accountNumber: { $type: "string" },
        },
      }
    );
  } catch (_) {}
})();

// debug
router.get("/_ping", (_req, res) => res.json({ ok: true, scope: "international-beneficiaries" }));

// list
router.get("/", checkAuth, async (req, res, next) => {
  try {
    const { internationalBeneficiaries } = collections();
    const userId = new ObjectId(req.user.id);
    const items = await internationalBeneficiaries
      .find({ userId, archived: { $ne: true } })
      .project({ userId: 0 })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// create
router.post("/", checkAuth, writeLimiter, validate(createIntlBeneficiarySchema), async (req, res) => {
  const { name, bankCode, accountNumber, currency, note } = req.validated;
  const { internationalBeneficiaries } = collections();
  const now = new Date();

  const doc = {
    userId: new ObjectId(req.user.id),
    name: name.trim(),
    bankCode: bankCode.trim(),
    accountNumber: accountNumber.trim(),
    currency: currency?.toUpperCase() || "ZAR",
    note: note || null,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const r = await internationalBeneficiaries.insertOne(doc);
    const out = { id: r.insertedId.toString(), ...doc };
    delete out.userId;
    return res.status(201).json(out);
  } catch (err) {
    if (err?.code === 11000) {
      req.log?.warn(
        { code: err.code, idx: "uniq_user_bank_account", keyValue: err.keyValue },
        "intl_beneficiary_duplicate_key"
      );
      return res.status(409).json({ error: "beneficiary_exists" });
    }
    req.log?.error({ err }, "intl_beneficiary_create_error");
    return res.status(500).json({ error: "create_failed" });
  }
});

module.exports = router;
