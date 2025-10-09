// src/schemas/accounts.schema.js
const Joi = require('joi');

const id = Joi.string().trim().length(24).hex().required();

const createAccountSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  type: Joi.string().valid('checking', 'savings', 'credit', 'investment', 'wallet').required(),
  currency: Joi.string().uppercase().length(3).default('USD'),
  balance: Joi.number().precision(2).min(0).default(0),
  note: Joi.string().max(500).allow('', null).default(null),
});

const updateAccountSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  type: Joi.string().valid('checking', 'savings', 'credit', 'investment', 'wallet'),
  currency: Joi.string().uppercase().length(3),
  balance: Joi.number().precision(2).min(0),
  note: Joi.string().max(500).allow('', null),
  archived: Joi.boolean(),
}).min(1);

const listQuerySchema = Joi.object({
  q: Joi.string().trim().allow(''),
  archived: Joi.boolean().truthy('true').falsy('false'),
  limit: Joi.number().integer().min(1).max(100).default(20),
  cursor: Joi.string().trim().allow(''), 
  userId: Joi.string().trim().length(24).hex().optional(), // admin only
});

const paramIdSchema = Joi.object({ id });

module.exports = {
  createAccountSchema,
  updateAccountSchema,
  listQuerySchema,
  paramIdSchema,
};
