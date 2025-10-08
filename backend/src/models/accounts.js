// src/models/accounts.js
const { getDb } = require('../db/mongo'); 

function accountsCol() {
  return getDb().collection('accounts');
}

async function ensureAccountIndexes() {
  const col = accountsCol();
  await col.createIndex({ userId: 1, name: 1 }, { unique: true, sparse: true });
  await col.createIndex({ userId: 1, archived: 1 });
}

module.exports = { accountsCol, ensureAccountIndexes };
