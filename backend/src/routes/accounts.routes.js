// src/routes/accounts.routes.js
const router = require('express').Router();
const { ObjectId } = require('mongodb');
const rateLimit = require('express-rate-limit');

const checkAuth = require('../middlewares/authRequired');
const validate = require('../middlewares/validate');
const {
  createAccountSchema,
  updateAccountSchema,
  listQuerySchema,
  paramIdSchema,
} = require('../schemas/accounts.schema');
const { accountsCol } = require('../models/accounts');

// --- Optional: light limiter ---
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/_ping', (_req, res) => res.json({ ok: true, scope: 'accounts' }));

// Helpers
function scopeUserId(req) {
  const isAdmin = req.user?.role === 'admin';
  const requestedUserId = req.query.userId;
  if (isAdmin && requestedUserId) return new ObjectId(requestedUserId);
  return new ObjectId(req.user.sub);
}

// --- List accounts ---
router.get(
  '/',
  checkAuth,
  validate(listQuerySchema, 'query'),
  async (req, res) => {
    try {
      const { q, archived, limit, cursor } = req.query;
      const userId = scopeUserId(req);

      const filter = { userId };
      if (typeof archived === 'boolean') filter.archived = archived;
      if (q) filter.name = { $regex: q, $options: 'i' };

      if (cursor) {
        // naive cursor using _id
        filter._id = { $gt: new ObjectId(cursor) };
      }

      const docs = await accountsCol
        .find(filter)
        .sort({ _id: 1 })
        .limit(Number(limit))
        .toArray();

      const nextCursor = docs.length ? docs[docs.length - 1]._id.toString() : null;

      res.json({
        items: docs.map(doc => ({
          id: doc._id.toString(),
          name: doc.name,
          type: doc.type,
          currency: doc.currency,
          balance: doc.balance,
          note: doc.note || null,
          archived: !!doc.archived,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        })),
        nextCursor,
      });
    } catch (err) {
      console.error('[accounts.list] error:', err);
      res.status(500).json({ error: 'Failed to list accounts.' });
    }
  }
);

// --- Create account ---
router.post(
  '/',
  checkAuth,
  writeLimiter,
  validate(createAccountSchema),
  async (req, res) => {
    try {
      const userId = scopeUserId(req);
      const { name, type, currency, balance, note } = req.body;

      const now = new Date();
      const doc = {
        userId,
        name,
        type,
        currency,
        balance,
        note: note || null,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };

      const existing = await accountsCol.findOne({ userId, name });
      if (existing) {
        return res.status(409).json({ error: 'Account name already exists for this user.' });
      }

      const insert = await accountsCol.insertOne(doc);
      res.status(201).json({
        id: insert.insertedId.toString(),
        ...doc,
        userId: undefined, // don’t leak userId
      });
    } catch (err) {
      console.error('[accounts.create] error:', err);
      res.status(500).json({ error: 'Failed to create account.' });
    }
  }
);

// --- Get by id ---
router.get(
  '/:id',
  checkAuth,
  validate(paramIdSchema, 'params'),
  async (req, res) => {
    try {
      const userId = scopeUserId(req);
      const _id = new ObjectId(req.params.id);

      const doc = await accountsCol.findOne({ _id, userId });
      if (!doc) return res.status(404).json({ error: 'Account not found.' });

      res.json({
        id: doc._id.toString(),
        name: doc.name,
        type: doc.type,
        currency: doc.currency,
        balance: doc.balance,
        note: doc.note || null,
        archived: !!doc.archived,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      });
    } catch (err) {
      console.error('[accounts.get] error:', err);
      res.status(500).json({ error: 'Failed to fetch account.' });
    }
  }
);

// --- Update (partial) ---
router.patch(
  '/:id',
  checkAuth,
  writeLimiter,
  validate(paramIdSchema, 'params'),
  validate(updateAccountSchema),
  async (req, res) => {
    try {
      const userId = scopeUserId(req);
      const _id = new ObjectId(req.params.id);

      // If name changes, enforce uniqueness per user
      if (req.body.name) {
        const dupe = await accountsCol.findOne({ userId, name: req.body.name, _id: { $ne: _id } });
        if (dupe) return res.status(409).json({ error: 'Account name already exists for this user.' });
      }

      const update = { ...req.body, updatedAt: new Date() };
      const { value } = await accountsCol.findOneAndUpdate(
        { _id, userId },
        { $set: update },
        { returnDocument: 'after' }
      );

      if (!value) return res.status(404).json({ error: 'Account not found.' });

      res.json({
        id: value._id.toString(),
        name: value.name,
        type: value.type,
        currency: value.currency,
        balance: value.balance,
        note: value.note || null,
        archived: !!value.archived,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
      });
    } catch (err) {
      console.error('[accounts.update] error:', err);
      res.status(500).json({ error: 'Failed to update account.' });
    }
  }
);

// --- Soft delete (archive) ---
router.delete(
  '/:id',
  checkAuth,
  writeLimiter,
  validate(paramIdSchema, 'params'),
  async (req, res) => {
    try {
      const userId = scopeUserId(req);
      const _id = new ObjectId(req.params.id);

      const { value } = await accountsCol.findOneAndUpdate(
        { _id, userId },
        { $set: { archived: true, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

      if (!value) return res.status(404).json({ error: 'Account not found.' });
      res.status(204).send();
    } catch (err) {
      console.error('[accounts.delete] error:', err);
      res.status(500).json({ error: 'Failed to delete account.' });
    }
  }
);

module.exports = router;
