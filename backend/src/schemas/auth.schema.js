// src/schemas/auth.schema.js
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerFullSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter a valid name').max(80),
  idNumber: z.string().regex(/^\d{13}$/, 'ID number must be exactly 13 digits'),
  accountNumber: z.string().regex(/^[A-Za-z0-9\- ]+$/, 'Invalid account number format'),
  email: z.string().email(),
  password: z.string().min(10, 'Password must be at least 10 chars'),
  confirmPassword: z.string().min(10),
  recaptchaToken: z.string().optional(), // you can enforce in prod later
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

module.exports = { registerSchema, loginSchema, registerFullSchema };

module.exports = { registerSchema, loginSchema };
