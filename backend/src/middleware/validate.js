const { ZodError } = require("zod");

// Generic body validator to keep controllers focused on business logic.
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(", ");
      return res.status(400).json({ message });
    }

    req.body = result.data;
    next();
  };
}

module.exports = { validateBody, ZodError };
