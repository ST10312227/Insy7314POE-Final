const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;       // from .env (Atlas connection string)
const dbName = process.env.MONGO_DB || 'insy7314';

if (!uri) {
  console.error('Missing MONGO_URI in .env');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

let db;

/** Connect once and cache the db handle */
async function initMongo() {
  if (db) return db;
  await client.connect();
  // sanity check
  await client.db(dbName).command({ ping: 1 });
  db = client.db(dbName);
  console.log(`✅ MongoDB connected (db: ${dbName})`);
  return db;
}

/** Get the db after initMongo() ran */
function getDb() {
  if (!db) throw new Error('Mongo not initialized — call initMongo() first.');
  return db;
}

module.exports = { initMongo, getDb, client };
