// Global error handler — catches errors from controllers, Mongoose, JWT, and
// anything thrown via AppError. Centralizing this means every controller can
// just `throw new AppError(...)` (or let a Mongoose error bubble up) instead
// of repeating res.status().json() boilerplate everywhere.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code && typeof err.code === "string" ? err.code : "INTERNAL_ERROR";
  let details;

  // Mongoose bad ObjectId (e.g. /api/patients/not-a-real-id)
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found (invalid ${err.path})`;
    code = "INVALID_ID";
  }

  // Mongoose duplicate key (unique index violation)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
    code = "DUPLICATE_KEY";
  }

  // Mongoose schema validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    details = Object.values(err.errors).map((val) => ({ field: val.path, message: val.message }));
    message = "Validation failed";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
    code = "INVALID_TOKEN";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
    code = "TOKEN_EXPIRED";
  }

  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Malformed JSON in request body";
    code = "MALFORMED_JSON";
  }

  // Log unexpected (non-operational) server errors with full context for debugging.
  // Operational errors (AppError, validation, 404s) are expected traffic noise and
  // don't need to be logged as loudly.
  if (statusCode >= 500) {
    console.error(`[${req.id || "no-id"}] ${req.method} ${req.originalUrl} ->`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(details ? { errors: details } : {}),
    requestId: req.id,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// Handles requests to undefined routes
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: `Route not found - ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
