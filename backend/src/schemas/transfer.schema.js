// src/schemas/transfer.schema.js
const { z } = require('zod');

// Common pieces
const currency = z.string().regex(/^[A-Z]{3}$/i, 'Invalid ISO currency');
const cents = z.number().int().positive();

const common = {
  sourceAccount: z.string().min(6).max(32),
  amountCents: cents,
  currency,                    // source currency, e.g., ZAR
  reference: z.string().min(3).max(140),
  idempotencyKey: z.string().min(8).max(64).optional(),
  scheduleAt: z.coerce.date().optional(),
};

// --- Local (domestic, other bank) ---
const localTransferSchema = z.object({
  ...common,
  type: z.literal('LOCAL'),
  beneficiaryName: z.string().min(2).max(120),
  beneficiaryAccount: z.string().min(6).max(32),
  branchCode: z.string().min(3).max(16),
});

// --- Same bank (internal) ---
const sameBankTransferSchema = z.object({
  ...common,
  type: z.literal('SAME_BANK'),
  beneficiaryName: z.string().min(2).max(120),
  beneficiaryAccount: z.string().min(6).max(32),
});

// --- International ---
const internationalTransferSchema = z.object({
  ...common,
  type: z.literal('INTERNATIONAL'),
  // Option A: use a saved beneficiary
  beneficiaryId: z.string().optional(),
  // Option B: raw details
  beneficiaryName: z.string().min(2).max(120).optional(),
  iban: z.string().regex(/^[A-Z0-9]{15,34}$/i, 'Invalid IBAN format').optional(),
  swiftBic: z.string().regex(/^[A-Z0-9]{8}([A-Z0-9]{3})?$/i, 'Invalid SWIFT/BIC').optional(),
  destinationCountry: z.string().length(2).optional(),
  // FX
  fxTargetCurrency: currency,
  fxRate: z.number().positive().optional(),
}).superRefine((v, ctx) => {
  const a = !!v.beneficiaryId;
  const b = !!(v.beneficiaryName && v.iban && v.swiftBic && v.destinationCountry);
  if (!a && !b) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide beneficiaryId OR full international beneficiary details.' });
  }
});

// A union that accepts any of the three
const transferSchema = z.discriminatedUnion('type', [
  localTransferSchema,
  sameBankTransferSchema,
  internationalTransferSchema,
]);

// Quote request (for showing fees and fx to the UI before commit)
const quoteSchema = z.object({
  kind: z.enum(['LOCAL','SAME_BANK','INTERNATIONAL']),
  amountCents: cents,
  currency,
  fxTargetCurrency: currency.optional(), // required for INTERNATIONAL
});

module.exports = {
  transferSchema,
  localTransferSchema,
  sameBankTransferSchema,
  internationalTransferSchema,
  quoteSchema,
};
