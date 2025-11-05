require("dotenv").config();
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

(async () => {
  try {
    // Accept multiple common names
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||          
      process.env.ATLAS_URI;

    if (!uri) throw new Error("MONGODB_URI / MONGO_URI missing in .env");

    // Prefer explicit DB_NAME, else parse from URI, else default to insy7314
    const dbName =
      process.env.DB_NAME ||
      (uri.split("/")[3]?.split("?")[0]) || // works for ...mongodb.net/<db>?...
      "insy7314";

    const EMPLOYEE_EMAIL = (process.env.SEED_EMPLOYEE_EMAIL || "employee@thevault.co").toLowerCase();
    const EMPLOYEE_PW = process.env.SEED_EMPLOYEE_PASSWORD || "Employee@123";
    const EMPLOYEE_NAME = process.env.SEED_EMPLOYEE_NAME || "Seeded Employee";

    console.log("🔗 Connecting to:", uri.replace(/:\/\/.*@/, "://<redacted>@"));
    console.log("🗄️  Database:", dbName);

    const client = new MongoClient(uri, { ignoreUndefined: true });
    await client.connect();

    const db = client.db(dbName);
    const employees = db.collection("employees");
    await employees.createIndex({ email: 1 }, { unique: true });

    const passwordHash = await bcrypt.hash(EMPLOYEE_PW, 12);

    const res = await employees.updateOne(
      { email: EMPLOYEE_EMAIL },
      {
        $setOnInsert: { createdAt: new Date() },
        $set: {
          email: EMPLOYEE_EMAIL,
          fullName: EMPLOYEE_NAME,
          passwordHash,
          status: "active",
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const one = await employees.findOne({ email: EMPLOYEE_EMAIL }, { projection: { passwordHash: 0 } });

    console.log(
      res.upsertedId ? `✅ Inserted employee ${EMPLOYEE_EMAIL}` : `✅ Updated employee ${EMPLOYEE_EMAIL}`
    );
    console.log("👤 Stored in:", `${dbName}.employees`);
    console.log("🔎 Found:", one);

    console.log("\nUse these credentials:");
    console.log(`  Email:    ${EMPLOYEE_EMAIL}`);
    console.log(`  Password: ${EMPLOYEE_PW}`);

    await client.close();
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
})();
