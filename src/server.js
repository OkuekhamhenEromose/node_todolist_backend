// Connects to MongoDB, calls app.listen()

const mongoose = require('mongoose')
const app = require('./app')
const config = require('./config')

/**
 * Server entry point.
 *
 * Responsibilities:
 * 1. Handle uncaught exceptions (synchronous errors outside Express)
 * 2. Connect to MongoDB via Mongoose
 * 3. Start HTTP server on configured port
 * 4. Handle unhandled promise rejections gracefully
 *
 * This file is NOT imported by tests. Tests import app.js directly.
 */

// ─── UNCAUGHT EXCEPTION HANDLER ──────────────────────────────────────────────
// Catches synchronous errors thrown outside the Express pipeline
// (e.g., require() failure, top-level syntax error)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Exit process — the app is in an undefined state
  process.exit(1)
})

// ─── DATABASE CONNECTION ─────────────────────────────────────────────────────
mongoose.connect(config.mongoUri).then(()=>{
  console.log('MongoDB connected successfully');

}).catch((err)=>{
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
})

// ─── START SERVER ────────────────────────────────────────────────────────────
const server = app.listen(config.port, () =>{
  console.log(
    `Server running in ${config.nodeEnv} mode on port ${config.port}`
  );

})

// ─── UNHANDLED REJECTION HANDLER ─────────────────────────────────────────────
// Catches rejected promises not handled by async/await try/catch
// (e.g., database query failure after initial connection)
process.on('unhandledRejection', (err) => {
  console.error("UNHANDLED REJECTION! Shutting down gracefully...");
  console.error(err.name, err.message);
  // Close server to finish pending requests, then exit
  server.close(() => {
    process.exit(1);
  });
});
