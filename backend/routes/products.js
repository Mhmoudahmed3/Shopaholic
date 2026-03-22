/**
 * @module routes/products.js
 * GET  /api/products           — paginated list with filtering & sorting (public)
 * GET  /api/products/:id       — single product with category (public)
 * GET  /api/products/:id/related — related products (public)
 * POST /api/products           — create product (Admin only)
 */

'use strict';

const express = require('express');
const {
  getProducts,
  getProduct,
  getRelatedProducts,
  createProduct,
} = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProduct);

// Admin-protected route
router.post('/', authMiddleware, adminMiddleware, createProduct);

module.exports = router;
