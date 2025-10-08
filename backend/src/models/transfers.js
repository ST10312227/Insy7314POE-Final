// src/models/transfers.js
const { getDb } = require('../db/mongo');

let ensured = false;

async function transfersCol() {
  const col = getDb().collection('transfers');
  if (!ensured) {
    // Common queries by user and date
    await col.createIndex({ userId: 1, createdAt: -1 });
    // Prevent double-spend with user-scoped idempotency
    await col.createIndex({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
    ensured = true;
  }
  return col;
}

module.exports = { transfersCol };
