// src/models/accounts.js
const { getDb } = require('../db/mongo'); 

function accountsCol() {
  return getDb().collection('accounts');
}

async function ensureAccountIndexes() {
  const col = accountsCol();

  // Best effort: drop the old unused index if it exists (ignore failures)
  try { await col.dropIndex('userId_1_name_1'); } catch {}

  await col.createIndex({ number: 1 }, { unique: true });
  await col.createIndex({ userId: 1 });
  await col.createIndex({ archived: 1 });
}

module.exports = { accountsCol, ensureAccountIndexes };
