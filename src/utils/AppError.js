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
