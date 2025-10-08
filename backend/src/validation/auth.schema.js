const { z } = require('zod');

// ---------- helpers ----------
const trimmedString = (min, max, msg) =>
  z.string().trim().min(min, msg || `must be at least ${min} chars`).max(max || 256);

const accountNumberSchema = trimmedString(6, 32, 'accountNumber too short').regex(
  /^[A-Za-z0-9\- ]+$/,
  'accountNumber must be alphanumeric'
);

// South African ID numbers are 13 digits (YYMMDDSSSSCAZ). Only validate length & digits here.
const saIdNumberSchema = z.string().trim().regex(/^\d{13}$/, 'idNumber must be 13 digits');

// Strong password policy
const passwordSchema = z.string()
  .min(10, 'password must be ≥ 10 characters')
  .max(128)
  .regex(/[A-Z]/, 'password must include an uppercase letter')
  .regex(/[a-z]/, 'password must include a lowercase letter')
  .regex(/\d/, 'password must include a number')
  .regex(/[^A-Za-z0-9]/, 'password must include a symbol');

/**
 * Human name whitelist:
 * - Starts with a letter
 * - Letters (incl. accents), combining marks, apostrophes, spaces, hyphens
 * - 2–120 chars total (length enforced by trimmedString wrapper in schemas)
 * NOTE: requires Unicode regex flag (Node 12+; you’re on Node 22 so it’s fine)
 */
const HUMAN_NAME_RE = /^[\p{L}][\p{L}\p{M}' -]*$/u;
const humanName = z.string()
  .trim()
  .min(2, 'fullName too short')
  .max(120, 'fullName too long')
  .regex(HUMAN_NAME_RE, "fullName can only contain letters, spaces, apostrophes, and hyphens");

/**
 * Safe free-text (for later use on descriptions/notes)
 * - Allows letters, numbers, spaces, and a small set of punctuation commonly needed
 * - 1–200 chars by default (can be overridden)
 */
const makeSafeText = (min = 1, max = 200, label = 'text') =>
  z.string()
    .trim()
    .min(min, `${label} too short`)
    .max(max, `${label} too long`)
    .regex(/^[A-Za-z0-9 .,'()\-&/]+$/, `${label} contains invalid characters`);

// Accept either v3 token (`recaptchaToken`) or v2 checkbox (`g-recaptcha-response`)
const recaptchaEnvelope = z
  .object({
    recaptchaToken: trimmedString(20, 4000, 'recaptchaToken is required').optional(),
    'g-recaptcha-response': trimmedString(20, 4000, 'g-recaptcha-response is required').optional(),
    recaptchaAction: trimmedString(2, 50).optional(), // optional (v3)
  })
  .superRefine((data, ctx) => {
    if (!data.recaptchaToken && !data['g-recaptcha-response']) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either recaptchaToken or g-recaptcha-response is required',
        path: ['recaptchaToken'],
      });
    }
  });

// ---------- schemas ----------

// Login for your current flow (accountNumber + idNumber + password + reCAPTCHA)
const loginSchema = z
  .object({
    accountNumber: accountNumberSchema,
    idNumber: saIdNumberSchema,
    password: passwordSchema,
  })
  .and(recaptchaEnvelope);

// Full registration used by the "Create Account" form
const registerFullSchema = z
  .object({
    fullName: humanName, // <— tightened whitelist for names
    idNumber: saIdNumberSchema,
    accountNumber: accountNumberSchema,
    email: z.string().trim().email('invalid email'),
    password: passwordSchema,
    confirmPassword: trimmedString(10, 128, 'confirmPassword too short'),
  })
  .and(recaptchaEnvelope)
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

// Refresh token envelope
const refreshSchema = z.object({
  refreshToken: trimmedString(20, 4000, 'refreshToken is required'),
});

// ---------- exports ----------
module.exports = {
  loginSchema,
  registerFullSchema,
  refreshSchema,

  // Export helpers for upcoming routes (e.g., transactions)
  HUMAN_NAME_RE,
  humanName,
  makeSafeText,
};
