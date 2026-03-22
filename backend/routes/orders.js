/**
 * @module routes/orders.js
 * POST /api/orders           — create order (protected: logged in users)
 * GET  /api/orders/my-orders — get current user's orders (protected)
 */

'use strict';

const express = require('express');
const { createOrder, getMyOrders } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Both routes require authentication
router.use(authMiddleware);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

module.exports = router;
