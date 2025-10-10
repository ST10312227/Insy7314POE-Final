// backend/src/routes/accounts.routes.js
const router = require("express").Router();
const { ObjectId } = require("mongodb");
const rateLimit = require("express-rate-limit");
const checkAuth = require("../middlewares/authRequired");
const validate = require("../middlewares/validate");
const { collections } = require("../db/collections");
const { z } = require("zod");

// ---- helpers -------------------------------------------------
function toProfile(doc = {}) {
  const fullName =
    (doc.fullName && String(doc.fullName).trim()) ||
    [doc.firstName, doc.lastName].filter(Boolean).join(" ").trim() ||
    (doc.name ? String(doc.name).trim() : "");

  return {
    id: doc._id?.toString?.() || "",
    fullName: fullName || "",
    email: doc.email || "",
    phone: doc.phone || doc.cell || "",
    idNumber: doc.idNumber || doc.identityNumber || "",
    currency: doc.currency || "ZAR",
  };
}

const updateSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120).optional(),
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    email: z.string().trim().email().max(254).optional(),
    phone: z.string().trim().regex(/^\+?\d{6,15}$/).optional(),
    idNumber: z.string().trim().min(6).max(64).optional(),
    currency: z.enum(["ZAR", "USD", "EUR", "GBP", "CNY"]).optional(),
  })
  .refine(v => Object.keys(v).length > 0, { message: "No changes submitted" });

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// quick health
router.get("/_ping", (_req, res) => res.json({ ok: true, scope: "accounts" }));

// ---- GET /accounts/me ---------------------------------------
router.get("/me", checkAuth, async (req, res) => {
  try {
    const { users } = collections(); // ✅ use users, not accounts
    const userId = req.user.id || req.user._id;

    const doc = await users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          _id: 1,
          fullName: 1,
          firstName: 1,
          lastName: 1,
          name: 1,
          email: 1,
          phone: 1,
          cell: 1,
          idNumber: 1,
          identityNumber: 1,
          currency: 1,
        },
      }
    );

    if (!doc) return res.status(404).json({ error: "user_not_found" });

    // Return in frontend-expected format
    res.json({ profile: toProfile(doc) });
  } catch (err) {
    console.error("accounts_me_error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

// ---- PUT /accounts/me ---------------------------------------
router.put("/me", checkAuth, writeLimiter, validate(updateSchema), async (req, res) => {
  try {
    const { users } = collections();
    const userId = new ObjectId(req.user.id);
    const payload = req.validated;

    const $set = { updatedAt: new Date() };
    if (payload.fullName) {
      $set.fullName = payload.fullName;
      const parts = payload.fullName.split(/\s+/);
      if (parts.length >= 2) {
        $set.firstName = parts.slice(0, -1).join(" ");
        $set.lastName  = parts.slice(-1).join(" ");
      }
    } else {
      if (payload.firstName !== undefined) $set.firstName = payload.firstName;
      if (payload.lastName  !== undefined) $set.lastName  = payload.lastName;
    }
    if (payload.email    !== undefined) $set.email    = payload.email;
    if (payload.phone    !== undefined) $set.phone    = payload.phone;
    if (payload.idNumber !== undefined) $set.idNumber = payload.idNumber;
    if (payload.currency !== undefined) $set.currency = payload.currency;

    const r = await users.findOneAndUpdate(
      { _id: userId },
      { $set },
      {
        returnDocument: "after",
        projection: {
          _id: 1, fullName: 1, firstName: 1, lastName: 1, name: 1,
          email: 1, phone: 1, cell: 1, idNumber: 1, identityNumber: 1, currency: 1,
        },
      }
    );
    if (!r.value) return res.status(404).json({ error: "user_not_found" });

    res.json({ profile: toProfile(r.value) });
  } catch (err) {
    req.log?.error({ err }, "accounts_update_error");
    res.status(500).json({ error: "update_failed" });
  }
});

module.exports = router;
