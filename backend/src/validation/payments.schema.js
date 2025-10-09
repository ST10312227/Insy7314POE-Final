const { z } = require("zod");

const NETWORKS = ["Cell C", "MTN", "Telkom Mobile", "Vodacom"];

const airtimePurchaseSchema = z.object({
  // who to top up
  name: z.string().trim().min(2).max(80),
  number: z.string().trim().regex(/^\d{10,15}$/, "number must be 10–15 digits"),
  network: z.enum(NETWORKS),

  // how much (R5–R1000); we’ll convert to cents
  amount: z.number().finite().min(5, "min R5").max(1000, "max R1000"),

  // optional: pick a specific account to debit (by account number)
  fromAccountNumber: z.string().trim().min(6).max(32).optional(),
});

module.exports = { airtimePurchaseSchema, NETWORKS };
