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

const passwordSchema = trimmedString(6, 128, 'password too short');

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
    fullName: trimmedString(2, 120, 'fullName too short'),
    idNumber: saIdNumberSchema,
    accountNumber: accountNumberSchema,
    email: z.string().trim().email('invalid email'),
    password: passwordSchema,
    confirmPassword: trimmedString(6, 128, 'confirmPassword too short'),
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
};
