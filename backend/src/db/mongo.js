// backend/src/db/mongo.js
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';
const uri = process.env.MONGO_URI;                 // Atlas connection string
const dbName = process.env.MONGO_DB || 'insy7314';

// If no URI: in tests export harmless stubs; otherwise fail fast (throw).
if (!uri) {
  if (isTest) {
    module.exports = {
      initMongo: async () => null,
      getDb: () => ({ collection: () => ({}) }),
      closeMongo: async () => {},
      client: null,
      __isMocked: true,
    };
  } else {
    throw new Error('Missing MONGO_URI in .env');
  }
} else {
  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });

  let db = null;
  let connectingPromise = null;

  async function initMongo() {
    if (db) return db;
    if (connectingPromise) return connectingPromise;

    connectingPromise = (async () => {
      await client.connect();
      const database = client.db(dbName);
      await database.command({ ping: 1 });
      db = database;
      if (!isTest) console.log(`✅ MongoDB connected (db: ${dbName})`);
      return db;
    })();

    return connectingPromise;
  }

  function getDb() {
    if (!db) throw new Error('Mongo not initialized — call initMongo() first.');
    return db;
  }

  async function closeMongo() {
    if (client && client.topology) await client.close();
    db = null;
    connectingPromise = null;
  }

  module.exports = { initMongo, getDb, closeMongo, client };
}
