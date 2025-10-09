// src/schemas/internationalBeneficiary.schema.js
const { z } = require('zod');

const country = z.string().length(2, 'Use ISO 3166-1 alpha-2 (e.g., GB, CN, US)');
const currency = z.string().regex(/^[A-Z]{3}$/i, 'Invalid ISO currency');
const nameText = z.string().min(1).max(120);

const InternationalBeneficiarySchema = z.object({
  kind: z.literal('INTERNATIONAL'),
  who: z.enum(['PERSON', 'BUSINESS']),
  country,
  // Person fields
  firstName: nameText.optional(),
  lastName: nameText.optional(),
  // Business field
  businessName: nameText.optional(),
  // Address
  address: z.string().min(3).max(200),
  city: z.string().min(2).max(120),
  // Bank details
  bankName: z.string().min(2).max(160),
  accountNumber: z.string().min(6).max(34), // IBAN or local acct
  swiftBic: z.string().regex(/^[A-Z0-9]{8}([A-Z0-9]{3})?$/i, 'Invalid SWIFT/BIC'),
  currency,
  nickname: z.string().min(2).max(60).optional()
}).superRefine((v, ctx) => {
  if (v.who === 'PERSON') {
    if (!v.firstName || !v.lastName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide firstName and lastName for PERSON' });
    }
  } else {
    if (!v.businessName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide businessName for BUSINESS' });
    }
  }
});

// Helper: compute a dedupe key
function buildDedupeKey(v) {
  return [
    v.country?.toUpperCase(),
    v.swiftBic?.toUpperCase(),
    v.accountNumber?.replace(/\s+/g, '').toUpperCase()
  ].join('|');
}

module.exports = { InternationalBeneficiarySchema, buildDedupeKey };
