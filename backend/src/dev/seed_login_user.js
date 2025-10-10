// backend/src/dev/seed_login_user.js
const bcrypt = require('bcryptjs');
const { initMongo, getDb } = require('../db/mongo');

async function run() {
  await initMongo();
  const db = getDb();

  const users = db.collection('users');
  const accounts = db.collection('accounts');

  const demo = {
    name: 'Demo User',
    email: 'demo@vault.app',
    idNumber: '9001015008087',
    role: 'user',
    passwordHash: await bcrypt.hash('Pass@123', 10),
    createdAt: new Date(),
  };

  let user = await users.findOne({ email: demo.email });
  if (!user) {
    const ins = await users.insertOne(demo);
    user = { _id: ins.insertedId, ...demo };
    console.log('✓ User created:', demo.email);
  } else {
    console.log('↺ User already exists:', demo.email);
  }



  console.log('\nSeed complete.\nLogin test creds:\n- Account Number: 1002003001\n- ID Number: 9001015008087\n- Password: Pass@123\n');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
