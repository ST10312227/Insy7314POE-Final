// backend/src/routes/accounts.routes.js
const router = require("express").Router();
const checkAuth = require("../middlewares/authRequired");
const validate = require("../middlewares/validate");
const { collections } = require("../db/collections");
const { ObjectId } = require("mongodb");
const { z } = require("zod");

const updateSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(7).max(20).optional(),
  currency: z.enum(["ZAR","USD","EUR","GBP","CNY"]).optional(),
}).refine(o => Object.keys(o).length > 0, { message: "no changes supplied" });

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

const updateMeHandler = async (req, res) => {
  try {
    const { users } = collections();
    const userId = new ObjectId(req.user.id || req.user._id);
    const p = req.validated;

    const $set = {};
    if (p.fullName !== undefined) $set.fullName = p.fullName;
    if (p.email    !== undefined) $set.email    = p.email;
    if (p.phone    !== undefined) $set.phone    = p.phone;
    if (p.currency !== undefined) $set.currency = p.currency;

    const r = await users.findOneAndUpdate(
      { _id: userId },
      { $set },
      {
        returnDocument: "after",
        projection: { _id: 1, fullName: 1, firstName: 1, lastName: 1, name: 1, email: 1, phone: 1, cell: 1, idNumber: 1, identityNumber: 1, currency: 1 },
      }
    );
    if (!r.value) return res.status(404).json({ error: "user_not_found" });
    res.json({ profile: toProfile(r.value) });
  } catch (err) {
    req.log?.error({ err }, "accounts_update_error");
    res.status(500).json({ error: "update_failed" });
  }
};

// GET still unchanged
router.get("/me", checkAuth, async (req, res) => {
  const { users } = collections();
  const userId = new ObjectId(req.user.id || req.user._id);
  const doc = await users.findOne(
    { _id: userId },
    { projection: { _id: 1, fullName: 1, firstName: 1, lastName: 1, name: 1, email: 1, phone: 1, cell: 1, idNumber: 1, identityNumber: 1, currency: 1 } }
  );
  if (!doc) return res.status(404).json({ error: "user_not_found" });
  res.json({ profile: toProfile(doc) });
});

// Accept both PATCH and PUT
router.patch("/me", checkAuth, validate(updateSchema), updateMeHandler);
router.put("/me",   checkAuth, validate(updateSchema), updateMeHandler);

router.get('/_alive', (_req, res) => res.json({ ok: true, scope: 'accounts' }));

module.exports = router;
