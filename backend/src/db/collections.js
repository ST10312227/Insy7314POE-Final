// backend/src/db/collections.js
const { getDb } = require('./mongo');

function collections() {
  const db = getDb();
  return {
    users: db.collection('users'),
    accounts: db.collection('accounts'),
    transactions: db.collection('transactions'),
    beneficiaries: db.collection('beneficiaries'),
    idempotency: db.collection('idempotency'),
    airtimePurchases: db.collection('airtimePurchases'),
  };
}

module.exports = { collections };
