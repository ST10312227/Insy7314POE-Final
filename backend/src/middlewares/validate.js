// verbose Zod validator
module.exports = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync(req.body);
    req.validated = parsed;
    next();
  } catch (err) {
    if (err?.issues) {
      return res.status(400).json({
        error: "validation_failed",
        issues: err.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message
        }))
      });
    }
    return res.status(400).json({ error: "validation_failed" });
  }
};
