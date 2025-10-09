// backend/src/routes/beneficiaries.routes.js
const router = require("express").Router();
const { ObjectId } = require("mongodb");
const rateLimit = require("express-rate-limit");
const checkAuth = require("../middlewares/authRequired");
const validate = require("../middlewares/validate");
const { collections } = require("../db/collections");
const { z } = require("zod");



// ---- Validation ----
const NETWORKS = ["Cell C", "MTN", "Telkom Mobile", "Vodacom"];
const createBeneficiarySchema = z.object({
  name: z.string().trim().min(2, "name too short").max(80, "name too long"),
  // allow friendly formats; we normalize to digits-only before storing
  number: z.string().trim().regex(/^\+?[\d ()-]{10,20}$/, "invalid number"),
  network: z.enum(NETWORKS, { errorMap: () => ({ message: "invalid network" }) }),
});

// ---- Helpers ----
const normalizeMsisdn = (s) => (s || "").replace(/\D/g, ""); // keep digits only

// ---- Rate limit writes ----
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Debug + ping
router.get("/_ping", (_req, res) => res.json({ ok: true, scope: "beneficiaries" }));

// Optional: quick diagnostics to see current indexes (remove in prod if you want)
router.get("/_diag/indexes", async (_req, res) => {
  try {
    const { beneficiaries } = collections();
    const idx = await beneficiaries.indexes();
    res.json({ indexes: idx });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Ensure proper unique index: (userId, numberNorm) ----
// We also add a partialFilter to only apply the unique constraint to docs that HAVE numberNorm.
// This avoids legacy docs (without numberNorm) causing false conflicts.
(async () => {
  try {
    const { beneficiaries } = collections();
    const existing = await beneficiaries.indexes();

    // Find bad/old indexes to drop
    const toDrop = existing
      .filter(ix => {
        const key = ix.key || {};
        const name = ix.name || "";
        // Drop if it's a single-field { number: 1 } index OR any legacy uniq_user_number*
        const isNumberOnly = Object.keys(key).length === 1 && key.number === 1;
        const isLegacyName = /^uniq_user_number$/i.test(name);
        return isNumberOnly || isLegacyName;
      })
      .map(ix => ix.name);

    for (const name of toDrop) {
      try { await beneficiaries.dropIndex(name); } catch (_) {}
    }

    // Create the desired unique index (id + normalized number)
    await beneficiaries.createIndex(
      { userId: 1, numberNorm: 1 },
      {
        name: "uniq_user_numberNorm",
        unique: true,
        background: true,
        // Only enforce uniqueness when numberNorm exists and is a string
        partialFilterExpression: { numberNorm: { $type: "string" } },
      }
    );
  } catch (_) {
    // ignore on startup
  }
})();

// ---- GET /payments/beneficiaries ----
router.get("/", checkAuth, async (req, res) => {
  const { beneficiaries } = collections();
  const userId = new ObjectId(req.user.id);

  const list = await beneficiaries
    .find({ userId, archived: { $ne: true } })
    .project({ userId: 0, numberNorm: 0 }) // hide internal fields
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ items: list });
});

// ---- POST /payments/beneficiaries ----
router.post("/", checkAuth, writeLimiter, validate(createBeneficiarySchema), async (req, res) => {
  const { name, number, network } = req.validated;
  const { beneficiaries } = collections();
  const now = new Date();

  const doc = {
    userId: new ObjectId(req.user.id),
    name: name.trim(),
    number: number.trim(),              // keep original formatting for display
    numberNorm: normalizeMsisdn(number),// used for uniqueness
    network,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const r = await beneficiaries.insertOne(doc);
    const out = { id: r.insertedId.toString(), ...doc };
    delete out.userId;
    delete out.numberNorm; // not needed by client
    return res.status(201).json(out);
  } catch (err) {
    if (err?.code === 11000) {
      // Helpful diagnostics in logs
      req.log?.warn({ code: err.code, codeName: err.codeName, keyValue: err.keyValue }, "beneficiary_duplicate_key");
      return res.status(409).json({ error: "beneficiary_exists" });
    }
    req.log?.error({ err }, "beneficiary_create_error");
    return res.status(500).json({ error: "create_failed" });
  }
});

module.exports = router;
