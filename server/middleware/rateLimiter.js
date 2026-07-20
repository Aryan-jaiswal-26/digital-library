const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const createLimiter = (options) =>
  rateLimit({
    windowMs: options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: options.max || parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
      success: false,
      message: options.message || 'Too many requests — please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit hit: ${req.ip} — ${req.originalUrl}`);
      res.status(options.statusCode).json(options.message);
    },
  });

// General API limiter
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many API requests from this IP',
});

// Strict limiter for auth routes — 5 attempts per 15 min
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  message: 'Too many login attempts — please try again in 15 minutes',
});

// Upload limiter — 10 uploads per hour
const uploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many upload requests — please try again later',
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };
