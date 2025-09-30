// src/models/users.js
const { getDb } = require('../db/mongo');

let ensured = false;

/** Returns the users collection and ensures a unique index on email (once). */
async function usersCol() {
  const col = getDb().collection('users');
  if (!ensured) {
    await col.createIndex({ email: 1 }, { unique: true });
    ensured = true;
  }
  return col;
}

module.exports = { usersCol };
