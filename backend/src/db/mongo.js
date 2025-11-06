// Central Mongo connection helper (lint-safe, no inner declarations)
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB || 'insy7314';

let client;
let db;
let isInitialized = false;

function createClient(connectionString) {
  return new MongoClient(connectionString, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

/** Connect once and cache the db handle */
async function initMongo() {
  if (isInitialized && db) return db;

  // In test runs, allow a lightweight stub when no URI is present
  if (!uri) {
    if ((process.env.NODE_ENV || '').toLowerCase() === 'test') {
      db = {
        databaseName: 'mockdb',
        // mimic db.command({ ping: 1 })
        command: async () => ({ ok: 1 }),
        // callers using collection() in unit tests can be stubbed/mocked
        collection: () => ({}),
      };
      isInitialized = true;
      return db;
    }
    throw new Error('Missing MONGO_URI in .env');
  }

  client = createClient(uri);
  await client.connect();
  db = client.db(dbName);
  // sanity check
  await db.command({ ping: 1 });
  isInitialized = true;
  return db;
}

/** Get the db after initMongo() ran */
function getDb() {
  if (!isInitialized || !db) {
    throw new Error('Mongo not initialized — call initMongo() first.');
  }
  return db;
}

/** Gracefully close the client (optional for tests/shutdown) */
async function closeMongo() {
  if (client) {
    await client.close();
    client = undefined;
  }
  db = undefined;
  isInitialized = false;
}

module.exports = { initMongo, getDb, closeMongo };
