// Why this file? The router declares the API surface. It maps the URL path to the controller function. It contains zero logic — just wiring.

const express = require("express");
const { checkHealth } = require("../controllers/healthController");

const router = express.Router();

/**
 * Health Check Route
 *
 * GET /api/v1/health
 *
 * Public endpoint. Returns API and database health status.
 * No authentication required.
 * */
router.get('/', checkHealth)

module.exports = router
