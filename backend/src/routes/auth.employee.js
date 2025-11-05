// routes/auth.employee.js
const router = require("express").Router();
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Accept multiple common env var names for the Mongo URI
const uri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/insy7314";

// Prefer explicit DB_NAME; else parse from URI; else default to insy7314
const parsedDbFromUri = (() => {
  try {
    // handles forms like ...mongodb.net/<db>?...
    const afterHost = uri.split("/")[3] || "";
    return afterHost.split("?")[0] || "";
  } catch {
    return "";
  }
})();

const dbName = process.env.DB_NAME || parsedDbFromUri || "insy7314";

// Single, lazy Mongo client
let client;
async function getDb() {
  if (!client) client = new MongoClient(uri, { ignoreUndefined: true });
  // For various driver versions, this covers both first and subsequent connects
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db(dbName);
}

function normEmail(v) {
  return String(v || "").trim().toLowerCase();
}

router.post("/employee/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const db = await getDb();
    const employees = db.collection("employees");

    const emp = await employees.findOne({ email: normEmail(email) });
    if (!emp) return res.status(401).json({ message: "Invalid credentials" });
    if (emp.status !== "active") return res.status(403).json({ message: "Account not active" });

    const ok = await bcrypt.compare(password, emp.passwordHash || "");
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      // Guardrail—helps avoid silent unsigned tokens
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const token = jwt.sign(
      {
        sub: emp._id.toString(),
        scope: "employee", // marks this token as employee-token
        email: emp.email,
        name: emp.fullName || "",
        typ: "access",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      profile: {
        id: emp._id.toString(),
        email: emp.email,
        fullName: emp.fullName || "",
        scope: "employee",
      },
    });
  } catch (err) {
    console.error("employee/login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- Optional: guard + /me endpoint for employees ---
function employeeRequired(req, res, next) {
  try {
    const h = String(req.headers.authorization || "");
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.scope !== "employee") return res.status(403).json({ message: "Forbidden" });

    req.employeeJwt = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// GET /api/auth/employee/me
router.get("/employee/me", employeeRequired, async (req, res) => {
  try {
    const db = await getDb();
    const employees = db.collection("employees");

    const emp = await employees.findOne(
      { _id: new ObjectId(req.employeeJwt.sub) },
      { projection: { passwordHash: 0 } }
    );
    if (!emp) return res.status(404).json({ message: "Not found" });

    res.json(emp);
  } catch (e) {
    console.error("employee/me error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
