// src/routes/beneficiaries.routes.js
const router = require('express').Router();
const { ObjectId } = require('mongodb');

const checkAuth = require('../middlewares/authRequired');
const validate = require('../middlewares/validate');
const { beneficiariesCol } = require('../models/beneficiaries');
const { InternationalBeneficiarySchema, buildDedupeKey } = require('../schemas/internationalBeneficiary.schema');

// Health
router.get('/_ping', checkAuth, (_req, res) => res.json({ ok: true, scope: 'beneficiaries' }));

// List INTERNATIONAL beneficiaries
router.get('/international', checkAuth, async (req, res) => {
  const col = await beneficiariesCol();
  const rows = await col.find({
    userId: new ObjectId(req.user.id),
    kind: 'INTERNATIONAL',
    archived: { $ne: true }
  }).sort({ createdAt: -1 }).toArray();

  const out = rows.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
  res.json(out);
});

// Create INTERNATIONAL beneficiary
router.post('/international', checkAuth, validate(InternationalBeneficiarySchema), async (req, res) => {
  const col = await beneficiariesCol();
  const doc = req.validated;
  const now = new Date();
  const userId = new ObjectId(req.user.id);

  const dedupeKey = buildDedupeKey(doc);
  await col.createIndex({ userId: 1, dedupeKey: 1 }, { unique: true });

  const insert = {
    userId,
    kind: 'INTERNATIONAL',
    ...doc,
    dedupeKey,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const ins = await col.insertOne(insert);
    res.status(201).json({ id: ins.insertedId.toString(), ...insert });
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ error: 'duplicate_beneficiary' });
    }
    throw e;
  }
});

// Soft delete (any kind)
router.delete('/:id', checkAuth, async (req, res) => {
  const col = await beneficiariesCol();
  const { id } = req.params;
  const userId = new ObjectId(req.user.id);
  const upd = await col.updateOne(
    { _id: new ObjectId(id), userId },
    { $set: { archived: true, updatedAt: new Date() } }
  );
  if (upd.matchedCount === 0) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

module.exports = router;
