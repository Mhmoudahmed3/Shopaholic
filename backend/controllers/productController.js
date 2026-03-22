/**
 * @module controllers/productController.js
 * @description Handles product listing, retrieval, and creation.
 * Uses Prisma ORM for all database operations.
 *
 * Supported query params for GET /api/products:
 *   page      (default 1)                    — page number
 *   limit     (default 12, max 50)           — results per page
 *   category  (categoryId UUID)              — filter by category ID
 *   size      (e.g. "M")                     — filter by size (array contains)
 *   color     (e.g. "Black")                 — filter by color (array contains)
 *   sort      (newest|price_asc|price_desc)  — ordering
 *   search    (string)                       — title/description text search
 */

'use strict';

const prisma = require('../prisma/client');
const ApiError = require('../utils/apiError');

// ── GET /api/products ────────────────────────────────────────────────────────

const getProducts = async (req, res, next) => {
  try {
    // --- Parse and sanitize query params ---
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const { category, search } = req.query;
    const sizeParam = req.query.size;
    const colorParam = req.query.color;
    const sort = req.query.sort || 'newest';

    // --- Build Prisma where clause ---
    const where = {};

    if (category) {
      where.categoryId = category;
    }
    // Prisma array filtering: support multi-select via hasSome (comma-separated values)
    if (sizeParam) {
      const sizes = sizeParam.split(',').map(s => s.trim());
      where.sizes = { hasSome: sizes };
    }
    if (colorParam) {
      const colors = colorParam.split(',').map(c => c.trim().toLowerCase());
      where.colors = { hasSome: colors };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // --- Determine orderBy ---
    const orderByMap = {
      newest:     { createdAt: 'desc' },
      "price-low": { price: 'asc' },
      "price-high":{ price: 'desc' },
      popularity: { popularity: 'desc' },
      rating:     { rating: 'desc' },
    };
    const orderBy = orderByMap[sort] || orderByMap.newest;

    // --- Run count + data queries in parallel ---
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
    ]);

    res.json({
      data: products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/products/:id ────────────────────────────────────────────────────

const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) throw new ApiError(404, `Product with id "${id}" not found.`);

    res.json({ data: product });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/products ────────────────────────────────────────────────────────
// Protected: Admin only (gated by authMiddleware + adminMiddleware in route)

const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      sku,
      stockQuantity,
      sizes,
      colors,
      imageUrls,
      categoryId,
    } = req.body;

    // Validate required fields
    if (!title || price == null || !sku) {
      throw new ApiError(400, 'title, price, and sku are required.');
    }

    // Check SKU uniqueness (Prisma will also throw P2002 but this gives a cleaner message)
    const existing = await prisma.product.findUnique({
      where: { sku },
      select: { id: true },
    });
    if (existing) {
      throw new ApiError(409, `A product with SKU "${sku}" already exists.`);
    }

    const product = await prisma.product.create({
      data: {
        title,
        description: description || null,
        price: parseFloat(price),
        sku,
        stockQuantity: stockQuantity ?? 0,
        sizes: Array.isArray(sizes) ? sizes : [],
        colors: Array.isArray(colors) ? colors : [],
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
        categoryId: categoryId || null,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    res.status(201).json({
      message: 'Product created successfully.',
      data: product,
    });
  } catch (err) {
    // Handle Prisma unique constraint violation gracefully
    if (err.code === 'P2002') {
      return next(new ApiError(409, `A product with that ${err.meta?.target} already exists.`));
    }
    next(err);
  }
};

// ── GET /api/products/:id/related ────────────────────────────────────────────

const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });
    if (!product) throw new ApiError(404, 'Product not found.');

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: id },
      },
      take: 4,
      select: {
        id: true,
        title: true,
        price: true,
        imageUrls: true,
        sizes: true,
        colors: true,
        sku: true,
      },
    });

    res.json({ data: related });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProduct, createProduct, getRelatedProducts };
