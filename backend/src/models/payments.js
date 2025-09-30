// src/models/payments.js
const { getDb } = require('../db/mongo');

let ensured = false;

async function paymentsCol() {
  const col = getDb().collection('payments');
  if (!ensured) {
    await col.createIndex({ userId: 1, createdAt: -1 });
    ensured = true;
  }
  return col;
}

module.exports = { paymentsCol };
