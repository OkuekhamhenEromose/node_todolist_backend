const path = require('path')

/**
 * Load environment variables from .env file in non-production environments.
 * In production (Docker, Heroku, AWS), env vars are injected by the platform.
 */
if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config({ path: path.json(__dirname, '../../.env')})
}

/**
 * Validate that all required environment variables are present.
 * Fail fast on startup rather than crashing mysteriously at runtime.
 */
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET']
const missingEnvVars = requiredEnvVars.filter((key)=> !process.env[key])

if (missingEnvVars.length > 0){
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  )
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
}
