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
    localBeneficiaries: db.collection('local_beneficiaries'),
    localTransfers: db.collection('local_transfers'),
    internationalBeneficiaries: db.collection('intl_beneficiaries'),
    internationalTransfers: db.collection('intl_transfers'),
  };
}

module.exports = { collections };
