// backend/src/db/mongo.js
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;           // Atlas connection string from .env
const dbName = process.env.MONGO_DB || 'insy7314';

// If no URI: in tests, export harmless stubs; otherwise fail fast without killing the process.
if (!uri) {
  if (process.env.NODE_ENV === 'test') {
    module.exports = {
      initMongo: async () => null,
      getDb: () => ({ collection: () => ({}) }),
      closeMongo: async () => {},
      client: null,
      __isMocked: true,
    };
    return;
  }
  throw new Error('Missing MONGO_URI in .env');
}

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let db = null;
let connectingPromise = null;

/** Connect once and cache the db handle */
async function initMongo() {
  if (db) return db;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    await client.connect();
    const database = client.db(dbName);
    // sanity check
    await database.command({ ping: 1 });
    db = database;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`✅ MongoDB connected (db: ${dbName})`);
    }
    return db;
  })();

  return connectingPromise;
}

/** Get the db after initMongo() ran */
function getDb() {
  if (!db) throw new Error('Mongo not initialized — call initMongo() first.');
  return db;
}

/** Close client (useful in test teardown) */
async function closeMongo() {
  if (client && client.topology) {
    await client.close();
  }
  db = null;
  connectingPromise = null;
}

module.exports = { initMongo, getDb, closeMongo, client };
