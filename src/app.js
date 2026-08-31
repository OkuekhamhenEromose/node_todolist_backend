// Creates Express app, configures middleware, mounts routes

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimite = require('express-rate-limit')

const errorHandler = require('./middleware/errorHandler')
const AppError = require('./utils/AppError')

// Create Express application instance
const app = express();

// ─── SECURITY MIDDLEWARE ─────────────────────────────────────────────────────

// Helmet: Sets security-focused HTTP headers (X-Content-Type-Options,
// X-Frame-Options, Content-Security-Policy, etc.)
app.use(helmet());

// CORS: Allow frontend on different origin to access API
// In production, restrict this to your frontend domain
app.use(cors());

// MongoDB Sanitize: Prevent NoSQL injection by removing $ and . operators
// from req.body, req.query, and req.params
app.use(mongoSanitize());

// Rate Limiting: Prevent brute-force and abuse
// Limits each IP to 100 requests per 15-minute window
const limiter = rateLimite({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP',
    error: {code: 'RATE_LIMIT_EXCEEDED'}
  }
})
app.use('/api/', limiter)

// ─── BODY PARSING ────────────────────────────────────────────────────────────

// Parse JSON bodies up to 10kb (prevents huge payload attacks)
app.use(express.json({ limit: '10kb' }));

// ─── DEVELOPMENT LOGGING ─────────────────────────────────────────────────────

// Morgan logs HTTP requests to console in development
// Format: METHOD /url STATUS response-time ms
if (process.env.NODE_ENV === 'development'){
  const morgan = require('morgan')
  app.use(morgan('dev'))
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────
// Routes will be mounted here as we implement features:
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/todos', todoRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────

// If no route matched above, the requested URL does not exist

app.all('*', (req, res, next) =>{
  next(
    new AppError(
      `can't find ${req.originalUrl} on this server`,
      404,
      'ROUTE_NOT_FOUND'
    )
  )
})

// ─── CENTRALIZED ERROR HANDLER ───────────────────────────────────────────────
// Must be the LAST middleware registered. Express recognizes it as error
// middleware because it has 4 parameters: (err, req, res, next)

app.use(errorHandler);

module.exports = app;
