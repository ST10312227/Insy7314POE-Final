// src/schemas/transfer.schema.js
const { z } = require('zod');

// Common pieces
const currency = z.string().regex(/^[A-Z]{3}$/i, 'Invalid ISO currency');
const cents = z.number().int().positive();

const common = {
  sourceAccount: z.string().min(6).max(32),             // account number
  amountCents: cents,                                    // smallest unit; e.g., ZAR cents
  currency,                                              // source currency (e.g., ZAR)
  reference: z.string().min(3).max(140),
  idempotencyKey: z.string().min(8).max(64).optional(),  // from Idempotency-Key header or body
  scheduleAt: z.coerce.date().optional(),                // optional future-dated transfer
};

// --- Local (domestic, other bank) ---
const localTransferSchema = z.object({
  ...common,
  type: z.literal('LOCAL'),
  beneficiaryName: z.string().min(2).max(120),
  beneficiaryAccount: z.string().min(6).max(32),
  branchCode: z.string().min(3).max(16),                 // routing/branch
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
  beneficiaryName: z.string().min(2).max(120),
  iban: z.string().regex(/^[A-Z0-9]{15,34}$/i, 'Invalid IBAN format'),
  swiftBic: z.string().regex(/^[A-Z0-9]{8}([A-Z0-9]{3})?$/i, 'Invalid SWIFT/BIC'),
  destinationCountry: z.string().length(2),              // ISO 3166-1 alpha-2
  fxTargetCurrency: currency,                            // e.g., USD/EUR/GBP
  // Optional client-provided quote; server will recompute/validate anyway
  fxRate: z.number().positive().optional(),
});

// A union that accepts any of the three
const transferSchema = z.discriminatedUnion('type', [
  localTransferSchema,
  sameBankTransferSchema,
  internationalTransferSchema,
]);

// Quote request (for showing fees and FX to the UI before commit)
const quoteSchema = z.object({
  kind: z.enum(['LOCAL','SAME_BANK','INTERNATIONAL']),
  amountCents: cents,
  currency,
  fxTargetCurrency: currency.optional(),                 // required for INTERNATIONAL
});

module.exports = {
  transferSchema,
  localTransferSchema,
  sameBankTransferSchema,
  internationalTransferSchema,
  quoteSchema,
};
