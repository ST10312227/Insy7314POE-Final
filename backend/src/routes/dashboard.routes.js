// backend/src/routes/dashboard.routes.js
const router = require('express').Router();
const { ObjectId } = require('mongodb');

const checkAuth = require('../middlewares/authRequired');
const { collections } = require('../db/collections');

console.log('[dashboard.routes] loaded');
router.get('/_ping', (_req, res) => res.json({ ok: true, scope: 'dashboard' }));

/**
 * GET /dashboard/summary
 * Query:
 *   accountId?   -> if omitted, summary uses ALL non-archived accounts of the user
 *   days?        -> window for income/expense chart (default 30)
 *   txLimit?     -> number of recent transactions to return (default 5)
 *
 * Response:
 * {
 *   user: { id, name },
 *   totals: { balance: number, currency: string },
 *   primary: { accountId?, number?, balance? },
 *   recentTransactions: [{ id, description, amount, direction, createdAt, accountId }],
 *   incomeExpense: { windowDays: number, income: number, expense: number, points: [{ d, income, expense }] }
 * }
 */
router.get('/summary', checkAuth, async (req, res) => {
  try {
    const { users, accounts, transactions } = collections();

    const userId = new ObjectId(req.user.sub);
    const accountId = req.query.accountId ? new ObjectId(req.query.accountId) : null;
    const windowDays = Math.max(1, Math.min(90, Number(req.query.days || 30)));
    const txLimit = Math.max(1, Math.min(50, Number(req.query.txLimit || 5)));

    // 1) Basic user info
    const user = await users.findOne({ _id: userId }, { projection: { name: 1 } });

    // 2) Accounts (non-archived)
    const acctFilter = { userId, archived: { $ne: true } };
    const accts = await accounts.find(acctFilter).project({
      number: 1, currency: 1, balanceCents: 1,
    }).toArray();

    // If user has no accounts yet
    if (!accts.length) {
      return res.json({
        user: { id: userId.toString(), name: user?.name || '' },
        totals: { balance: 0, currency: 'ZAR' },
        primary: null,
        recentTransactions: [],
        incomeExpense: { windowDays, income: 0, expense: 0, points: [] },
      });
    }

    // 3) Totals (sum across visible accounts or chosen account)
    let chosenIds = accts.map(a => a._id);
    if (accountId) chosenIds = [accountId];

    const chosenAccts = accts.filter(a => chosenIds.some(id => id.equals(a._id)));
    const currency = chosenAccts[0]?.currency || 'ZAR';
    const totalCents = chosenAccts.reduce((sum, a) => sum + (a.balanceCents || 0), 0);

    // "Primary" card — pick first matching account or null
    const primary = chosenAccts[0] ? {
      accountId: chosenAccts[0]._id.toString(),
      number: chosenAccts[0].number,
      balance: (chosenAccts[0].balanceCents || 0) / 100,
    } : null;

    // 4) Recent transactions (cross-account if no accountId specified)
    const txFilter = {
      userId,
      ...(accountId ? { accountId } : { accountId: { $in: chosenIds } }),
    };

    const recentTx = await transactions.find(txFilter)
      .project({ description: 1, amountCents: 1, direction: 1, createdAt: 1, accountId: 1 })
      .sort({ createdAt: -1, _id: -1 })
      .limit(txLimit)
      .toArray();

    const recentTransactions = recentTx.map(t => ({
      id: t._id.toString(),
      description: t.description || '',
      amount: (t.amountCents || 0) / 100,
      direction: t.direction || 'debit', // 'debit' | 'credit'
      createdAt: t.createdAt || new Date(),
      accountId: t.accountId?.toString(),
    }));

    // 5) Income vs Expense over last N days
    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    const pieAgg = await transactions.aggregate([
      { $match: { userId, createdAt: { $gte: since }, ...(accountId ? { accountId } : { accountId: { $in: chosenIds } }) } },
      { $group: {
        _id: '$direction',
        sumCents: { $sum: '$amountCents' },
      } }
    ]).toArray();

    let incomeCents = 0, expenseCents = 0;
    for (const p of pieAgg) {
      if (p._id === 'credit') incomeCents += p.sumCents || 0;
      if (p._id === 'debit')  expenseCents += p.sumCents || 0;
    }

    // Optional: daily points for a simple line/area chart
    const pointsAgg = await transactions.aggregate([
      { $match: { userId, createdAt: { $gte: since }, ...(accountId ? { accountId } : { accountId: { $in: chosenIds } }) } },
      { $project: {
        y: { $dateTrunc: { date: '$createdAt', unit: 'day' } },
        amountCents: 1, direction: 1,
      }},
      { $group: {
        _id: { y: '$y', direction: '$direction' },
        sumCents: { $sum: '$amountCents' },
      }},
      { $group: {
        _id: '$_id.y',
        incomeCents: {
          $sum: { $cond: [{ $eq: ['$_id.direction', 'credit'] }, '$sumCents', 0] }
        },
        expenseCents: {
          $sum: { $cond: [{ $eq: ['$_id.direction', 'debit'] }, '$sumCents', 0] }
        }
      }},
      { $sort: { _id: 1 } }
    ]).toArray();

    const points = pointsAgg.map(p => ({
      d: p._id,                           // ISO date (UTC midnight)
      income: (p.incomeCents || 0) / 100,
      expense: (p.expenseCents || 0) / 100,
    }));

    return res.json({
      user: { id: userId.toString(), name: user?.name || '' },
      totals: { balance: totalCents / 100, currency },
      primary,
      recentTransactions,
      incomeExpense: {
        windowDays,
        income: incomeCents / 100,
        expense: expenseCents / 100,
        points,
      },
    });
  } catch (err) {
    req.log?.error({ err }, 'dashboard_summary_error');
    return res.status(500).json({ error: 'dashboard_failed' });
  }
});

module.exports = router;
