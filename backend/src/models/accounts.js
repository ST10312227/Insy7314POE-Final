// src/models/accounts.js
const { getDb } = require('../db/mongo'); 

function accountsCol() {
  return getDb().collection('accounts');
}

async function ensureAccountIndexes() {
  const col = accountsCol();
  try { await col.dropIndex('userId_1_name_1'); } catch (err) {
  console.error("[accounts] operation failed:", err);
}

  await col.createIndex({ number: 1 }, { unique: true });
  await col.createIndex({ userId: 1 });
  await col.createIndex({ archived: 1 });
}

module.exports = { accountsCol, ensureAccountIndexes };
