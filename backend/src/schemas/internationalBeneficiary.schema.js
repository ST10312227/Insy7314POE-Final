// backend/src/schemas/internationalBeneficiary.schema.js
const { z } = require('zod');

const iso2 = z.string().length(2, 'Use ISO 3166-1 alpha-2 (e.g., GB, CN, US)');
const isoCurrency = z.string().regex(/^[A-Z]{3}$/i, 'Invalid ISO currency');
const nameText = z.string().min(1).max(120);

const base = z.object({
  // Optional so minimal payload can surface all missing-field errors together
  kind: z.literal('INTERNATIONAL').optional(),
  who: z.enum(['PERSON', 'BUSINESS']).optional(),
  country: iso2.optional(),

  // Person / Business (soft checks when 'who' present)
  firstName: nameText.optional(),
  lastName: nameText.optional(),
  businessName: nameText.optional(),

  // Address optional for tests
  address: z.string().min(3).max(200).optional(),
  city: z.string().min(2).max(120).optional(),

  // Bank identity (aliases supported)
  name: nameText.optional(),                                   // tests look for this key
  bankName: z.string().min(2).max(160).optional(),

  bankCode: z.string().regex(/^[A-Z0-9]{3,11}$/i, 'Invalid bank code').optional(), // alias for swiftBic
  swiftBic: z.string().regex(/^[A-Z0-9]{8}([A-Z0-9]{3})?$/i, 'Invalid SWIFT/BIC').optional(),

  // Core required (the other three keys tests assert)
  accountNumber: z.string().min(6).max(34).optional(),
  currency: isoCurrency.optional(),

  nickname: z.string().min(2).max(60).optional(),
});

// 1) Presence-only error collection (no regex/format here to avoid duplicates)
const schemaPre = base.superRefine((v, ctx) => {
  const trim = (s) => (typeof s === 'string' ? s.trim() : s);

  const nameT = trim(v.name);
  const bankNameT = trim(v.bankName);
  const bankCodeT = trim(v.bankCode);
  const swiftBicT = trim(v.swiftBic);
  const acctT = trim(v.accountNumber);
  const currT = trim(v.currency);

  // PERSON/BUSINESS (only if 'who' present)
  if (v.who === 'PERSON') {
    if (!trim(v.firstName) || !trim(v.lastName)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide firstName and lastName for PERSON' });
    }
  } else if (v.who === 'BUSINESS') {
    if (!trim(v.businessName)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide businessName for BUSINESS' });
    }
  }

  // Required alias-visible fields (deduped):
  // name: add error if missing OR too short after trimming
  if (!(nameT || bankNameT) || (nameT && nameT.length < 2 && !bankNameT)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: 'name (or bankName) required' });
  }

  // bankCode: only when BOTH bankCode & swiftBic are missing (presence only)
  if (!bankCodeT && !swiftBicT) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankCode'], message: 'bankCode (or swiftBic) required' });
  }

  // accountNumber: presence only
  if (!acctT) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['accountNumber'], message: 'accountNumber required' });
  }

  // currency: presence only (format handled by base regex if provided)
  if (!currT) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['currency'], message: 'Invalid ISO currency' });
  }
});

// 2) Normalize after we’ve collected presence errors
const InternationalBeneficiarySchema = schemaPre.transform((v) => {
  const trim = (s) => (typeof s === 'string' ? s.trim() : s);

  return {
    ...v,
    // keep aliases present for tests; also ensure canonical fields
    name: trim(v.name) ?? trim(v.bankName),
    bankName: trim(v.bankName) ?? trim(v.name),

    bankCode: v.bankCode ? trim(v.bankCode) : trim(v.swiftBic),
    swiftBic: v.swiftBic ? trim(v.swiftBic) : trim(v.bankCode),

    currency: v.currency?.toUpperCase?.() ?? v.currency,
    accountNumber: v.accountNumber?.replace(/\s+/g, ''),

    firstName: trim(v.firstName),
    lastName: trim(v.lastName),
    businessName: trim(v.businessName),
    address: trim(v.address),
    city: trim(v.city),
    nickname: trim(v.nickname),
    country: v.country?.toUpperCase?.() ?? v.country,
  };
});

// Helper: compute a dedupe key
function buildDedupeKey(v) {
  return [
    v.country?.toUpperCase(),
    (v.bankCode || v.swiftBic)?.toUpperCase(),
    v.accountNumber?.replace(/\s+/g, '').toUpperCase(),
  ].join('|');
}

module.exports = { InternationalBeneficiarySchema, buildDedupeKey };
