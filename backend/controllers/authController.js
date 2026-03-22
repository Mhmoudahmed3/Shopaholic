/**
 * @module controllers/authController.js
 * @description Handles user registration and login.
 * Passwords are hashed with bcrypt (12 salt rounds).
 * JWTs are signed with the JWT_SECRET env variable.
 * Uses Prisma ORM for all database operations.
 */

'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const ApiError = require('../utils/apiError');

/**
 * Signs a JWT for the given user payload.
 * @param {{ id: string, email: string, role: string }} user
 * @returns {string} signed JWT
 */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ── POST /api/auth/register ──────────────────────────────────────────────────

/**
 * Register a new customer account.
 * Body: { firstName, lastName, email, password }
 * Returns: { token, user: { id, firstName, lastName, email, role } }
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1. Validate required fields
    if (!firstName || !lastName || !email || !password) {
      throw new ApiError(400, 'firstName, lastName, email and password are all required.');
    }
    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long.');
    }

    // 2. Ensure email is not already taken
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    // 3. Hash the password (12 rounds ≈ 250 ms — good balance of cost vs speed)
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Create the user (role defaults to CUSTOMER per schema)
    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 5. Sign and return the JWT
    const token = signToken(user);
    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────────────────────

/**
 * Log in with email and password.
 * Body: { email, password }
 * Returns: { token, user: { id, firstName, lastName, email, role } }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    // 2. Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // 3. Compare password against stored bcrypt hash
    //    Generic error to avoid user enumeration
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    // 4. Sign and return the JWT
    const token = signToken(user);
    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────────

/**
 * Return the currently authenticated user's profile.
 * Protected — requires authMiddleware.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) throw new ApiError(404, 'User not found.');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
