// src/schemas/payment.schema.js
const { z } = require('zod');

const paymentSchema = z.object({
  beneficiary: z.string().min(2).max(120),
  iban: z.string().regex(/^[A-Z0-9]{15,34}$/i, 'Invalid IBAN format'),
  amount: z.number().positive(),
  reference: z.string().min(3).max(140),
});

module.exports = { paymentSchema };
