const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// ─── Token Helpers ────────────────────────────────────────────────────────────

const signAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

const signRefreshToken = (id, version) => {
  return jwt.sign({ id, version }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/v1/auth/refresh',
  });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.validatedBody;

    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('Email already in use', 400));

    const user = await User.create({ name, email, password, role });

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id, 0);
    setRefreshCookie(res, refreshToken);

    logger.info(`New user registered: ${email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      accessToken,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    const user = await User.findOne({ email }).select('+password +refreshTokenVersion');
    if (!user || !(await user.comparePassword(password))) {
      // Generic message — don't reveal which field was wrong
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account deactivated — contact support', 403));
    }

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id, user.refreshTokenVersion);
    setRefreshCookie(res, refreshToken);

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/refresh
 * Rotates refresh token — issues new access + refresh tokens
 */
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return next(new AppError('No refresh token', 401));

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    const user = await User.findById(decoded.id).select('+refreshTokenVersion');
    if (!user || !user.isActive) {
      return next(new AppError('User not found', 401));
    }

    // Version mismatch — token was already rotated or user logged out all devices
    if (decoded.version !== user.refreshTokenVersion) {
      logger.warn(`Refresh token reuse detected for user: ${decoded.id}`);
      return next(new AppError('Token already used — please log in again', 401));
    }

    // Rotate: increment version (invalidates old token) + issue new tokens
    await user.incrementTokenVersion();
    const newRefreshToken = signRefreshToken(user._id, user.refreshTokenVersion + 1);
    const newAccessToken = signAccessToken(user._id, user.role);
    setRefreshCookie(res, newRefreshToken);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/logout
 * Invalidates refresh token by bumping version
 */
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await req.user.incrementTokenVersion();
    }
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/auth/me
 */
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, refresh, logout, getMe };
