// src/routes/payments.routes.js
const router = require('express').Router();
const { ObjectId } = require('mongodb');

const validate = require('../middlewares/validate');
const checkAuth = require('../middlewares/authRequired');
const { paymentSchema } = require('../schemas/payment.schema');
const { paymentsCol } = require('../models/payments');

// Health
router.get('/_ping', checkAuth, (_req, res) => res.json({ ok: true, scope: 'payments' }));

// Create a payment
router.post('/', checkAuth, validate(paymentSchema), async (req, res) => {
  const { beneficiary, iban, amount, reference } = req.validated;
  const col = await paymentsCol();

  const doc = {
    userId: new ObjectId(req.user.id),
    beneficiary: beneficiary.trim(),
    iban: iban.replace(/\s+/g, '').toUpperCase(),
    amount,
    currency: 'ZAR',
    reference: reference.trim(),
    status: 'PENDING_STAFF_REVIEW',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const ins = await col.insertOne(doc);
  res.status(201).json({ id: ins.insertedId.toString(), ...doc });
});

// List my payments (newest first)
router.get('/', checkAuth, async (req, res) => {
  const col = await paymentsCol();
  const rows = await col
    .find({ userId: new ObjectId(req.user.id) })
    .sort({ createdAt: -1 })
    .toArray();

  const out = rows.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
  res.json(out);
});

module.exports = router;
