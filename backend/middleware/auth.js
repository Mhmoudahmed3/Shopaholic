/**
 * @module middleware/auth.js
 * @description JWT authentication and admin authorization middleware.
 *
 * Usage:
 *   const { authMiddleware, adminMiddleware } = require('./middleware/auth');
 *   router.post('/orders', authMiddleware, orderController.createOrder);
 *   router.post('/products', authMiddleware, adminMiddleware, productController.createProduct);
 *
 * Authorization header format:
 *   Authorization: Bearer <jwt>
 *
 * On success: attaches `req.user = { id, email, role }` and calls `next()`.
 * On failure: forwards an ApiError(401 or 403) to the global error handler.
 */

'use strict';

const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

// ── authMiddleware ────────────────────────────────────────────────────────────

/**
 * Verifies the JWT in the Authorization header.
 * Injects `req.user = { id, email, role }` on success.
 */
const authMiddleware = (req, _res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // Header must exist and start with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided. Please log in.');
    }

    const token = authHeader.split(' ')[1];

    // Verify the token against JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload to req.user for downstream use
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'Invalid or expired token. Please log in again.'));
  }
};

// ── adminMiddleware ───────────────────────────────────────────────────────────

/**
 * Requires the user to have the ADMIN role.
 * Must be chained AFTER authMiddleware.
 *
 * @example
 *   router.post('/products', authMiddleware, adminMiddleware, createProduct);
 */
const adminMiddleware = (req, _res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Forbidden. Admin access required.'));
  }
  next();
};

// Keep backwards-compatible aliases for any existing code referencing old names
const verifyToken = authMiddleware;
const requireAdmin = adminMiddleware;

module.exports = { authMiddleware, adminMiddleware, verifyToken, requireAdmin };
