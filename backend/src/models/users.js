// src/models/users.js
const { getDb } = require('../db/mongo');

function usersCol() {
  return getDb().collection('users');
}

async function ensureUserIndexes() {
  const col = usersCol();
  await col.createIndex({ email: 1 }, { unique: true, sparse: true });
  await col.createIndex({ idNumber: 1 }, { unique: true, sparse: true });
}

module.exports = { usersCol, ensureUserIndexes };
