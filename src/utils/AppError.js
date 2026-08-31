/**
 * Custom application error class.
 *
 * Extends the native Error class to attach HTTP status codes and machine-readable
 * error codes. This allows our centralized error handler to distinguish between
 * expected operational errors (e.g., "Todo not found") and unexpected programming
 * errors (e.g., null reference).
 *
 * Usage:
 *   throw new AppError('Todo not found', 404, 'TODO_NOT_FOUND');
 */
class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR', details = null){
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details; // health check error response needs to include details: { database: 'disconnected' }. We add an optional details parameter.
    // Mark as operational so we don't leak stack traces for known errors
    this.isOperational = true;
    // Capture stack trace, excluding this constructor from the trace

    // Capture stack trace, excluding this constructor from the trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
