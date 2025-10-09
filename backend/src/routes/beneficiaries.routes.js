const router = require("express").Router();
const { ObjectId } = require("mongodb");
const rateLimit = require("express-rate-limit");
const checkAuth = require("../middlewares/authRequired");
const validate = require("../middlewares/validate");
const { collections } = require("../db/collections");
const { z } = require("zod");

// --- validation (simple, adjust as needed) ---
const NETWORKS = ["Cell C", "MTN", "Telkom Mobile", "Vodacom"];
const createBeneficiarySchema = z.object({
  name: z.string().trim().min(2).max(80),
  number: z.string().trim().regex(/^\d{10,15}$/, "number must be 10–15 digits"),
  network: z.enum(NETWORKS),
});

// --- rate limit writes ---
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// quick ping for debugging
router.get("/_ping", (_req, res) => res.json({ ok: true, scope: "beneficiaries" }));

// ensure unique (userId + number)
(async () => {
  try {
    const { beneficiaries } = collections();
    await beneficiaries.createIndex({ userId: 1, number: 1 }, { unique: true, name: "uniq_user_number" });
  } catch (_) {}
})();

// GET /payments/beneficiaries
router.get("/", checkAuth, async (req, res) => {
  const { beneficiaries } = collections();
  const userId = new ObjectId(req.user.id);
  const list = await beneficiaries
    .find({ userId, archived: { $ne: true } })
    .project({ userId: 0 })
    .sort({ createdAt: -1 })
    .toArray();
  res.json({ items: list });
});

// POST /payments/beneficiaries
router.post("/", checkAuth, writeLimiter, validate(createBeneficiarySchema), async (req, res) => {
  const { name, number, network } = req.validated;
  const { beneficiaries } = collections();
  const now = new Date();
  const doc = {
    userId: new ObjectId(req.user.id),
    name,
    number,
    network,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const r = await beneficiaries.insertOne(doc);
    res.status(201).json({ id: r.insertedId.toString(), ...doc });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: "beneficiary_exists" });
    req.log?.error({ err }, "beneficiary_create_error");
    res.status(500).json({ error: "create_failed" });
  }
});

module.exports = router;
