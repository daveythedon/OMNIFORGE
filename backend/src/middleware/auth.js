/**
 * Authentication Middleware - Clerk Integration
 * Verifies JWT tokens from Clerk and attaches user to request
 */

const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

const authMiddleware = ClerkExpressWithAuth({
  // Clerk will automatically use CLERK_SECRET_KEY from env
});

/**
 * Require authentication - returns 401 if not authenticated
 */
const requireAuth = (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  next();
};

/**
 * Require specific role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Attach user from database to request
 * Call after authMiddleware
 */
const attachUser = async (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return next();
  }

  try {
    const { User } = require('../models');
    const user = await User.findOne({
      where: { clerkId: req.auth.userId }
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('Error attaching user:', error);
    next();
  }
};

module.exports = {
  authMiddleware,
  requireAuth,
  requireRole,
  attachUser
};
