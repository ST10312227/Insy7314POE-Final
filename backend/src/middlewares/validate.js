// src/middlewares/validate.js
module.exports = (schema) => (req, res, next) => {
  // Quick guard if schema wasn't passed correctly
  if (!schema || typeof schema.safeParse !== 'function') {
    console.error('[VALIDATE] Missing or invalid schema:', schema);
    return res.status(500).json({ error: 'Server misconfiguration: schema not provided to validator' });
  }

  console.log('[VALIDATE] body =', req.body); // temp debug

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.errors, // path + message
    });
  }
  req.validated = result.data;
  next();
};
