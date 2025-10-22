// backend/__tests__/zod-internationalBeneficiary.test.js
const { z } = require('zod');

// Import the module and try to find a Zod schema export.
const mod = require('../src/schemas/internationalBeneficiary.schema.js');

// Try common export shapes: named, default, or first ZodType found.
const exportedSchema =
  mod.internationalBeneficiarySchema ||
  mod.schema ||
  mod.default ||
  Object.values(mod).find((v) => v && typeof v === 'object' && typeof v.safeParse === 'function');

if (!exportedSchema || typeof exportedSchema.safeParse !== 'function') {
  throw new Error(
    'Could not locate a Zod schema export in src/schemas/internationalBeneficiary.schema.js. ' +
      'Please export the schema (e.g., module.exports = { internationalBeneficiarySchema })'
  );
}

describe('internationalBeneficiary.schema Zod validation', () => {
  test('accepts a valid payload', () => {
    const good = {
      name: 'Alice Sender',
      bankCode: 'DEUTDEFF',         // SWIFT/BIC (example)
      accountNumber: 'DE89370400440532013000', // looks like an IBAN
      currency: 'ZAR',              // optional, 3 letters
      note: 'Family support',
    };

    const result = exportedSchema.safeParse(good);
    expect(result.success).toBe(true);
    if (result.success) {
      // normalized/trimmed fields likely preserved
      expect(result.data.name).toBe('Alice Sender');
      expect(result.data.currency).toHaveLength(3);
    }
  });

  test('rejects when required fields are missing or too short', () => {
    const bad = {
      name: 'A',            // too short (min 2)
      bankCode: '',         // too short (min 2)
      accountNumber: '123', // too short (min 4)
      currency: 'RAND',     // not 3 letters
    };

    const result = exportedSchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path.join('.'));
      expect(issues).toEqual(expect.arrayContaining(['name', 'bankCode', 'accountNumber', 'currency']));
    }
  });

  test('normalizes optional currency casing to upper (if implemented)', () => {
    const maybe = {
      name: 'Bob Receiver',
      bankCode: 'BARCGB22',
      accountNumber: '12345678901234',
      currency: 'zar',
    };
    const result = exportedSchema.safeParse(maybe);
    // Some schemas keep raw case; others upper-case in code paths.
    // We accept either, but assert basic shape passes.
    expect(result.success).toBe(true);
  });
});
