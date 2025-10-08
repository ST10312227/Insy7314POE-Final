// backend/src/db/indexes.js
/**
 * Centralized index creation for all MongoDB collections.
 * Each model can also expose its own ensureXxxIndexes() helper.
 */

const { collections } = require('./collections');
const { ensureAccountIndexes } = require('../models/accounts');

/**
 * Safely creates an index, ignoring "already exists" errors.
 * MongoDB error codes 85 / 86 are benign duplicates.
 */
async function safeCreateIndex(col, keys, opts) {
  try {
    await col.createIndex(keys, opts);
  } catch (e) {
    if (e && (e.code === 85 || e.code === 86)) {
      // Duplicate index definition – safe to ignore
      return;
    }
    console.error(`[indexes] failed to create index ${opts?.name || JSON.stringify(keys)}:`, e);
    throw e;
  }
}

/**
 * Ensures all necessary indexes across collections.
 * Called during server startup in src/server.js.
 */
async function ensureIndexes() {
  const { users, accounts, transactions, beneficiaries, idempotency } = collections();

  // --- ACCOUNTS (model-specific indexes first) ---
  // Uses ensureAccountIndexes() from models/accounts.js
  await ensureAccountIndexes();

  // --- USERS ---
  await safeCreateIndex(users, { email: 1 }, { name: 'users_email_unique', unique: true, sparse: true });
  await safeCreateIndex(users, { idNumber: 1 }, { name: 'users_idNumber' });

  // --- ACCOUNTS ---
  await safeCreateIndex(accounts, { userId: 1 }, { name: 'accounts_userId' });
  await safeCreateIndex(accounts, { number: 1 }, { name: 'accounts_number_unique', unique: true });

  // --- TRANSACTIONS ---
  await safeCreateIndex(transactions, { accountId: 1, createdAt: -1 }, { name: 'tx_account_createdAt' });
  await safeCreateIndex(transactions, { idempotencyKey: 1 }, { name: 'tx_idempotencyKey' });

  // --- BENEFICIARIES ---
  await safeCreateIndex(beneficiaries, { userId: 1, nickname: 1 }, { name: 'ben_user_nickname' });
  await safeCreateIndex(
    beneficiaries,
    { userId: 1, bankCode: 1, accountNumber: 1 },
    { name: 'ben_unique_by_user_bank_acc', unique: true }
  );

  // --- IDEMPOTENCY ---
  await safeCreateIndex(idempotency, { key: 1 }, { name: 'idem_key_unique', unique: true });

  console.log('[db.indexes] ✅ all indexes ensured');
}

module.exports = { ensureIndexes };
