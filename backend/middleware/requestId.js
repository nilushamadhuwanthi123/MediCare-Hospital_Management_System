const crypto = require("crypto");

// Attaches a short unique id to every request. It's echoed back in the
// X-Request-Id response header and included in error responses, so a user
// reporting "I got an error" can hand back one ID that maps to one exact
// server log line — much easier to debug in production than guessing.
const requestId = (req, res, next) => {
  req.id = crypto.randomBytes(6).toString("hex");
  res.setHeader("X-Request-Id", req.id);
  next();
};

module.exports = requestId;
