const rateLimit = require("express-rate-limit");

// General limiter applied to all /api routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});

// Stricter limiter for login/register — slows down credential-stuffing and
// brute-force attacks without punishing normal API usage elsewhere.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again in a few minutes." },
});

module.exports = { apiLimiter, authLimiter };
