/**
 * @module routes/auth.js
 * POST /api/auth/register  — create a new customer account
 * POST /api/auth/login     — authenticate and receive a JWT
 * GET  /api/auth/me        — get current user's profile (protected)
 */

'use strict';

const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

module.exports = router;
