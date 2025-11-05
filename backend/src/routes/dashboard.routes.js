// backend/src/routes/dashboard.routes.js
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
 * GET /api/dashboard/intl-beneficiaries
 * Returns international beneficiaries with light enrichment from users/accounts.
 * Transactions are NOT involved.
 */
router.get("/intl-beneficiaries", employeeRequired, async (req, res) => {
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

    // Shape for the UI table
    {
      $project: {
        _id: 0,
        customerName: {
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

        // No amount present in this collection; render as "—" on client
        amountCents: null,

        // Simple derived status
        status: {
          $cond: [{ $eq: ["$archived", true] }, "Archived", "Verified"],
        },
      },
    },
  ];

  const items = await db
    .collection("intl_beneficiaries")
    .aggregate(pipeline)
    .toArray();

  res.json(items);
});

module.exports = router;
