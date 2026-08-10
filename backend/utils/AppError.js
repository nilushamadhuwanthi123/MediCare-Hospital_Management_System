// Custom application error class.
// Lets controllers `throw new AppError("message", 404)` and have
// asyncHandler funnel it straight to the global error handler with the
// right status code and a machine-readable `code` for the frontend.
class AppError extends Error {
  constructor(message, statusCode = 500, code = "APP_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // distinguishes expected errors from programming bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
