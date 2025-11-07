const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getDb } = require("../db/mongo");

// --- minimal employee auth guard (token issued by /api/auth/employee/login) ---
function employeeRequired(req, res, next) {
  try {
    const h = String(req.headers.authorization || "");
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.scope !== "employee") {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.employeeJwt = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Common projection pipeline for intl_beneficiaries
 * (used by list and single-get).
 */
function beneficiariesProjectStage() {
  // expression that resolves preferred display name:
  // users.name -> users.fullName -> firstName + lastName
  const preferredNameExpr = {
    $ifNull: [
      "$user.name",
      {
        $ifNull: [
          "$user.fullName",
          {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$user.firstName", ""] },
                  " ",
                  { $ifNull: ["$user.lastName", ""] },
                ],
              },
            },
          },
        ],
      },
    ],
  };

  return {
    $project: {
      id: { $toString: "$_id" },

      // expose both name and customerName for UI convenience
      name: preferredNameExpr,
      customerName: preferredNameExpr,

      customerAccount: { $ifNull: ["$acct.number", ""] },

      beneficiaryName: {
        $ifNull: [
          "$name",
          {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$firstName", ""] },
                  " ",
                  { $ifNull: ["$lastName", ""] },
                ],
              },
            },
          },
        ],
      },
      beneficiaryAccount: { $ifNull: ["$accountNumber", ""] },
      swift: { $ifNull: ["$swiftCode", ""] },
      currency: { $ifNull: ["$currency", ""] },

      amountCents: null,

      // Status precedence:
      // 1) explicit status
      // 2) archived=true  => "Archived"
      // 3) verified=true  => "Verified"
      // 4) default        => "Pending"
      status: {
        $cond: [
          { $ifNull: ["$status", false] },
          "$status",
          {
            $cond: [
              { $eq: ["$archived", true] },
              "Archived",
              {
                $cond: [{ $eq: ["$verified", true] }, "Verified", "Pending"],
              },
            ],
          },
        ],
      },
      createdAt: 1,
      updatedAt: 1,
    },
  };
}

/**
 * GET /api/dashboard/intl-beneficiaries
 * Returns international beneficiaries with light enrichment from users/accounts.
 * Transactions are NOT involved.
 */
router.get("/intl-beneficiaries", employeeRequired, async (_req, res) => {
  const db = getDb();

  const pipeline = [
    // Only show non-archived entries by default
    { $match: { $or: [{ archived: { $exists: false } }, { archived: false }] } },

    // Join owning user (for customer name)
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },

    // Join first account for that user (optional)
    {
      $lookup: {
        from: "accounts",
        let: { uid: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$userId", "$$uid"] } } },
          { $sort: { createdAt: 1 } },
          { $limit: 1 },
        ],
        as: "acct",
      },
    },
    { $addFields: { acct: { $first: "$acct" } } },

    beneficiariesProjectStage(),
    { $sort: { _id: -1 } },
  ];

  const items = await db.collection("intl_beneficiaries").aggregate(pipeline).toArray();
  res.json(items);
});

/**
 * GET /api/dashboard/intl-beneficiaries/:id
 * Fetch a single beneficiary (same shape as list).
 */
router.get("/intl-beneficiaries/:id", employeeRequired, async (req, res) => {
  const db = getDb();
  let _id;
  try {
    _id = new ObjectId(req.params.id);
  } catch (e) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const pipeline = [
    { $match: { _id } },

    // Join owning user
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },

    // Join first account
    {
      $lookup: {
        from: "accounts",
        let: { uid: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$userId", "$$uid"] } } },
          { $sort: { createdAt: 1 } },
          { $limit: 1 },
        ],
        as: "acct",
      },
    },
    { $addFields: { acct: { $first: "$acct" } } },

    beneficiariesProjectStage(),
  ];

  const doc = await db.collection("intl_beneficiaries").aggregate(pipeline).next();
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
});

/**
 * GET /api/dashboard/intl-payments
 * Lists international transfers/payments (pending + others unless filtered on client).
 */
router.get("/intl-payments", employeeRequired, async (_req, res) => {
  const db = getDb();

  const preferredNameExpr = {
    $ifNull: [
      "$user.name",
      {
        $ifNull: [
          "$user.fullName",
          {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$user.firstName", ""] },
                  " ",
                  { $ifNull: ["$user.lastName", ""] },
                ],
              },
            },
          },
        ],
      },
    ],
  };

  const pipeline = [
    { $match: { archived: { $ne: true } } },

    // Join user -> name
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $addFields: { user: { $first: "$user" } } },

    // Join first account
    {
      $lookup: {
        from: "accounts",
        let: { uid: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$userId", "$$uid"] } } },
          { $sort: { createdAt: 1 } },
          { $limit: 1 },
        ],
        as: "acct",
      },
    },
    { $addFields: { acct: { $first: "$acct" } } },

    {
      $project: {
        id: { $toString: "$_id" },

        // expose both name & customerName
        name: preferredNameExpr,
        customerName: preferredNameExpr,

        customerAccount: { $ifNull: ["$acct.number", ""] },
        beneficiaryName: { $ifNull: ["$beneficiary.name", ""] },
        beneficiaryAccount: { $ifNull: ["$beneficiary.accountNumber", ""] },
        swift: { $ifNull: ["$beneficiary.swiftCode", ""] },
        currency: { $ifNull: ["$currency", ""] },
        amountCents: null,

        // keep whatever status transfers already have (Pending on creation per intl.routes.js)
        status: { $ifNull: ["$status", "Pending"] },
        verifiedAt: 1,
        verifiedBy: 1,
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  const items = await db.collection("internationalTransfers").aggregate(pipeline).toArray();
  res.json(items);
});

/**
 * PATCH /api/dashboard/intl-payments/:id/status
 * Body: { status: "Verified" | "Declined" | "Pending" | "Archived" }
 */
router.patch("/intl-payments/:id/status", employeeRequired, async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body || {};

    const ALLOWED = ["Verified", "Declined", "Pending", "Archived"];
    if (!ALLOWED.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const db = getDb();
    const set = {
      status,
      updatedAt: new Date(),
    };

    if (status === "Verified") {
      set.verifiedAt = new Date();
      set.verifiedBy = req.employeeJwt.sub;
    } else {
      set.verifiedAt = null;
      set.verifiedBy = null;
    }

    const r = await db
      .collection("internationalTransfers")
      .updateOne({ _id: new ObjectId(id) }, { $set: set });

    if (!r.matchedCount) return res.status(404).json({ message: "Not found" });

    res.json({ ok: true, id, status });
  } catch (e) {
    res.status(500).json({ message: "Internal error" });
  }
});

// PATCH /api/dashboard/intl-beneficiaries/:id/status
// Body: { status: "Verified" | "Declined" | "Pending" | "Archived" }
router.patch("/intl-beneficiaries/:id/status", employeeRequired, async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body || {};

    const ALLOWED = ["Verified", "Declined", "Pending", "Archived"];
    if (!ALLOWED.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const db = getDb();
    const set = {
      status,
      updatedAt: new Date(),
    };

    if (status === "Verified") {
      set.verifiedAt = new Date();
      set.verifiedBy = req.employeeJwt.sub;
      set.archived = false;
    } else if (status === "Archived") {
      set.archived = true;
      set.verifiedAt = null;
      set.verifiedBy = null;
    } else {
      set.archived = false;
      set.verifiedAt = null;
      set.verifiedBy = null;
    }

    const r = await db
      .collection("intl_beneficiaries")
      .updateOne({ _id: new ObjectId(id) }, { $set: set });

    if (!r.matchedCount) return res.status(404).json({ message: "Not found" });

    res.json({ ok: true, id, status });
  } catch (e) {
    res.status(500).json({ message: "Internal error" });
  }
});

module.exports = router;
