// Generic validation middleware factory.
// Usage: router.post("/", validate(registerSchema), controllerFn)
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Replace req.body with the validated (and defaulted) value
    req.body = value;
    next();
  };
};

module.exports = validate;
