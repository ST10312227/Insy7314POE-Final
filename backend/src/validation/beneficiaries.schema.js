const { z } = require("zod");

const msisdn = z.string().trim().regex(/^\d{10,15}$/, "number must be 10–15 digits");

const NETWORKS = ["Cell C", "MTN", "Telkom Mobile", "Vodacom"];

const createBeneficiarySchema = z.object({
  name: z.string().trim().min(2, "name too short").max(80, "name too long"),
  number: msisdn,
  network: z.enum(NETWORKS, { errorMap: () => ({ message: "invalid network" }) }),
});

module.exports = { createBeneficiarySchema, NETWORKS };
