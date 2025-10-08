// src/models/beneficiaries.js
const { getDb } = require('../db/mongo');

let ensured = false;

async function beneficiariesCol() {
  const col = getDb().collection('beneficiaries');
  if (!ensured) {
    await col.createIndex({ userId: 1, kind: 1, dedupeKey: 1 }, { unique: true, sparse: true });
    await col.createIndex({ userId: 1, createdAt: -1 });
    ensured = true;
  }
  return col;
}

module.exports = { beneficiariesCol };
