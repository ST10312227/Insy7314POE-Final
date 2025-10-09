const router = require("express").Router();
const { ObjectId } = require("mongodb");
const checkAuth = require("../middlewares/authRequired");
const validate = require("../middlewares/validate");
const rateLimit = require("express-rate-limit");
const { airtimePurchaseSchema } = require("../validation/payments.schema");
const { collections } = require("../db/collections");

// write rate limit
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// quick ping (optional)
router.get("/_ping", (_req, res) => res.json({ ok: true, scope: "payments" }));

/**
 * POST /payments/airtime
 * Body: { name, number, network, amount, fromAccountNumber? }
 * Returns: { id, amountCents, balanceAfter?, createdAt }
 */
router.post(
  "/airtime",
  checkAuth,
  writeLimiter,
  validate(airtimePurchaseSchema),
  async (req, res) => {
    const { name, number, network, amount, fromAccountNumber } = req.validated;
    const { accounts, airtimePurchases } = collections();
    const userId = new ObjectId(req.user.id);
    const amountCents = Math.round(Number(amount) * 100);
    const now = new Date();

    // --- pick an account to debit (if you keep balances) ---
    let debitedAccount = null;
    let newBalance = null;

    try {
      // OPTIONAL BALANCE DEDUCTION: only if you track balances
      // Try to find user’s account (by provided number or first active)
      const account =
        (fromAccountNumber &&
          (await accounts.findOne({ userId, number: fromAccountNumber }))) ||
        (await accounts.findOne({ userId, archived: { $ne: true } }));

      if (account) {
        const currentCents =
          typeof account.balanceCents === "number"
            ? account.balanceCents
            : Math.round(Number(account.balance || 0) * 100);

        if (currentCents < amountCents) {
          return res.status(402).json({ error: "insufficient_funds" });
        }

        // atomically decrement
        const upd = await accounts.findOneAndUpdate(
          { _id: account._id, userId, balanceCents: { $gte: amountCents } },
          { $inc: { balanceCents: -amountCents }, $set: { updatedAt: now } },
          { returnDocument: "after" }
        );

        if (!upd.value) {
          return res.status(409).json({ error: "balance_conflict" });
        }

        debitedAccount = {
          id: upd.value._id.toString(),
          number: upd.value.number,
          currency: upd.value.currency || "ZAR",
        };
        newBalance = upd.value.balanceCents / 100;
      }

      // record purchase
      const doc = {
        userId,
        name,
        number,
        network,
        amountCents,
        currency: "ZAR",
        account: debitedAccount,
        createdAt: now,
        updatedAt: now,
      };

      const r = await airtimePurchases.insertOne(doc);

      return res.status(201).json({
        id: r.insertedId.toString(),
        amountCents,
        currency: "ZAR",
        account: debitedAccount,
        balanceAfter: newBalance,
        createdAt: now,
      });
    } catch (err) {
      req.log?.error({ err }, "airtime_purchase_error");
      return res.status(500).json({ error: "airtime_failed" });
    }
  }
);

module.exports = router;
