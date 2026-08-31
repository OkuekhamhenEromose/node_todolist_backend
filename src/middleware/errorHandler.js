// Why centralized? Without this, every controller needs its own try/catch for database errors, JWT errors, and validation errors. One middleware means one place to change formatting, one place to log, one place to prevent information leakage

const AppError = require("../utils/AppError");

/**
 * Centralized Express error handling middleware.
 *
 * This is the last middleware in the Express pipeline. It catches all errors
 * thrown by controllers, services, Mongoose, or JWT operations and formats
 * them into the consistent API error envelope defined in Phase 4.
 *
 * Error types handled:
 * - Mongoose validation errors (invalid schema data)
 * - Mongoose duplicate key errors (unique constraint violations)
 * - Mongoose cast errors (invalid ObjectId format)
 * - JWT errors (malformed or expired tokens)
 * - Operational AppErrors (expected business logic failures)
 * - Unknown errors (programming bugs — sanitized in production)
 */

const errorHandler = (err, req, res, next) => {
  // Ensure status code and error code are set
  err.statusCode = err.statusCode || 500;
  err.code = err.code || "INTERNAL_ERROR";

  // A. Mongoose validation error — invalid data against schema
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(422).json({
      success: false,
      message: "Validation Failed",
      error: {
        code: "VALIDATION_ERROR",
        details: messages,
      },
    });
  }

  // B. Mongoose duplicate key — unique index violation (e.g., email exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      error: {
        code: "DUPLICATE_FIELD",
        details: { [field]: `${field} is already taken` },
      },
    });
  }
  // C. Mongoose cast error — invalid ObjectId passed where ObjectId expected
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      error: {
        code: "INVALID_OBJECT_ID",
      },
    });
  }
  // D. JWT malformed signature or payload
  if (err.nam === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: {
        code: "INVALID_TOKEN",
      },
    });
  }
  // E. JWT expired
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      error: {
        code: "TOKEN_EXPIRED",
      },
    });
  }
  // F. Operational errors — expected business logic failures we threw intentionally
  if (Error.isOperational) {
    const errorResponse = {
      success: false,
      message: err.message,
      error: {
        code: err.code,
      },
    };
    // Include details if provided (e.g., validation fields, health check status)
    if (err.details){
      errorResponse.error.details = err.details;
    }
    return
  }


  // G. Unknown/programming errors — do not leak details in production
  console.error("ERROR 💥", err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: {
      code: "INTERNAL_ERROR",
      // Only expose stack traces in development for debugging
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};;

module.exports = errorHandler;
