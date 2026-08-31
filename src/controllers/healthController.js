const mongoose = require('mongoose')
const catchasync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')

/**
 * Health Check Controller
 *
 * Checks the MongoDB connection state via Mongoose and returns a health report.
 * This endpoint is public (no authentication) and is intended for monitoring
 * systems, load balancers, and developers verifying deployment status.
 *
 * MongoDB readyState values:
 *   0 = disconnected
 *   1 = connected
 *   2 = connecting
 *   3 = disconnecting
 */

const checkHealth = catchasync(async (req, res) =>{
  // No next() call needed because we send the response directly with res.status().json()
  // We use catchAsync so any unexpected error (e.g., Mongoose throws) flows to the error handler.
  // Mongoose exposes the driver's connection state as a numeric readyState.
  // We consider the service healthy ONLY when readyState === 1 (connected).
  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1;

  if (!isHealthy) {
    // Map numeric readyState to a human-readable string for the error response.
    const dbStateMap = {
      0: "disconnected",
      1: "connecting",
      3: "disconnecting",
    };
    // Throw an operational error so the centralized error handler formats
    // the response consistently with our API error envelope.
    throw new AppError("Service unhealthy", 500, "SERVICE_UNAVAILABILITY", {
      // We use AppError for the unhealthy case so the response format matches all other API errors.
      database: dbStateMap[dbState] || "unknown",
    });
  }

  // Service is healthy. Return 200 with diagnostic data.
  // process.uptime() returns seconds since Node.js process started.
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(), // process.uptime() is a Node.js built-in — no dependencies needed.
      database: "connected",
    },
  });
})

module.exports = {
  checkHealth,
}
