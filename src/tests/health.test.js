// Why this file? We verify the endpoint behaves correctly without starting the server on a real port or relying on manual curl commands.

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("GET /api/v1/health", () => {
  /**
   * Success Case: Database is connected (mongodb-memory-server is running).
   *
   * Verifies:
   * - HTTP status is 200
   * - Response envelope follows API contract (success, data)
   * - Health payload contains expected fields
   * - Database status reports 'connected'
   */
  it("should return 200 and health status when database is connected", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe("healthy");
    expect(res.body.data.database).toBe("connected");

    // Timestamp should be a valid ISO string
    expect(new Date(res.body.data.timestamp).toISOString()).toBe(
      res.body.data.timestamp,
    );

    // Uptime should be a positive number (seconds since process start)
    expect(typeof res.body.data.uptime).toBe("number");
    expect(res.body.data.uptime).toBeGreaterThanOrEqual(0);
  });

  /**
   * Error Case: Database is disconnected.
   *
   * We temporarily override mongoose.connection.readyState to simulate
   * a disconnection. This tests the error path without actually stopping
   * the in-memory database (which would break subsequent tests).
   *
   * Verifies:
   * - HTTP status is 500
   * - Response envelope follows error contract
   * - Error code is SERVICE_UNAVAILABLE
   * - Details include database state
   */
  it("should return 500 when database is disconnected", async () => {
    // Save the real readyState so we can restore it after the test.
    const originalReadyState = mongoose.connection.readyState;

    // Override readyState to simulate disconnection.
    // We use Object.defineProperty because readyState is typically a getter.
    Object.defineProperty(mongoose.connection, "readyState", {
      value: 0,
      configurable: true,
    });

    const res = await request(app).get("/api/v1/health");

    // Restore readyState immediately so other tests are unaffected.
    Object.defineProperty(mongoose.connection, "readyState", {
      value: originalReadyState,
      configurable: true,
    });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Service unhealthy");
    expect(res.body.error.code).toBe("SERVICE_UNAVAILABLE");
    expect(res.body.error.details).toBeDefined();
    expect(res.body.error.details.database).toBe("disconnected");
  });
});
