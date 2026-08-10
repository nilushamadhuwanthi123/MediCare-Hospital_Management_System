// Lightweight, dependency-free guard against NoSQL injection.
// Strips any object key starting with "$" or containing "." from
// req.body / req.query / req.params before it ever reaches a Mongoose
// query — e.g. blocks a login payload like { email: { "$gt": "" } }
// that would otherwise bypass the intended query logic.
const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const clean = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = sanitizeValue(value[key]);
    }
    return clean;
  }

  return value;
};

const sanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  // req.query is a getter-only object on some Express/Node versions — mutate in place instead of reassigning
  if (req.query) {
    const cleaned = sanitizeValue(req.query);
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, cleaned);
  }
  next();
};

module.exports = sanitize;
