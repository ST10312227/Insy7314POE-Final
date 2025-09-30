// src/routes/payments.routes.js
const router = require('express').Router();
const { ObjectId } = require('mongodb');

const validate = require('../middlewares/validate');
const checkAuth = require('../middlewares/authRequired'); // you already have this
const { paymentSchema } = require('../schemas/payment.schema');
const { paymentsCol } = require('../models/payments');

// small probe if you want to test wiring
router.get('/_ping', checkAuth, (_req, res) => res.json({ ok: true, scope: 'payments' }));

// Create a payment
router.post('/', checkAuth, validate(paymentSchema), async (req, res) => {
  const { beneficiary, iban, amount, reference } = req.validated;
  const col = await paymentsCol();

  const doc = {
    userId: new ObjectId(req.user.id),
    beneficiary,
    iban: iban.toUpperCase(),
    amount: Number(amount),
    reference,
    createdAt: new Date(),
  };

  const result = await col.insertOne(doc);
  return res.status(201).json({ id: result.insertedId.toString() });
});

// List my payments (newest first)
router.get('/', checkAuth, async (req, res) => {
  const col = await paymentsCol();
  const rows = await col
    .find({ userId: new ObjectId(req.user.id) })
    .sort({ createdAt: -1 })
    .toArray();

  // map _id -> id
  const out = rows.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
  res.json(out);
});

module.exports = router;
