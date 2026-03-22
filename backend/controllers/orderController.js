/**
 * @module controllers/orderController.js
 * @description Handles order creation and retrieval.
 *
 * Security: totals are ALWAYS re-calculated server-side from DB prices.
 * A malicious client cannot manipulate the amount by editing the cart payload.
 *
 * Flow (createOrder):
 *   1. Validate the incoming items array
 *   2. Fetch real prices + stock from the database
 *   3. Validate stock availability
 *   4. Calculate totalAmount server-side
 *   5. Create Order + OrderItems + decrement stock in a single Prisma transaction
 *   6. Return the order summary
 */

'use strict';

const prisma = require('../prisma/client');
const ApiError = require('../utils/apiError');

// ── POST /api/orders ──────────────────────────────────────────────────────────

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user.id; // injected by authMiddleware

    // 1. Validate input ──────────────────────────────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Order must include at least one item.');
    }

    for (const item of items) {
      if (
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        throw new ApiError(
          400,
          'Each item must have a productId and a positive integer quantity.'
        );
      }
    }

    // 2. De-duplicate product IDs
    const productIds = [...new Set(items.map((i) => i.productId))];

    // 3. Fetch real prices + stock from DB ────────────────────────────────────
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, price: true, stockQuantity: true },
    });

    const productMap = Object.fromEntries(dbProducts.map((p) => [p.id, p]));

    // 4. Validate stock and build line items ──────────────────────────────────
    let totalAmount = 0;
    const lineItems = [];

    for (const item of items) {
      const dbProduct = productMap[item.productId];

      if (!dbProduct) {
        throw new ApiError(404, `Product "${item.productId}" not found.`);
      }
      if (dbProduct.stockQuantity < item.quantity) {
        throw new ApiError(
          422,
          `Insufficient stock for "${dbProduct.title}". Available: ${dbProduct.stockQuantity}.`
        );
      }

      const unitPrice = Number(dbProduct.price);
      totalAmount += unitPrice * item.quantity;

      lineItems.push({
        productId: dbProduct.id,
        quantity: item.quantity,
        priceAtPurchase: unitPrice,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
      });
    }

    totalAmount = parseFloat(totalAmount.toFixed(2));

    // 5. Persist everything in a Prisma transaction ───────────────────────────
    const order = await prisma.$transaction(async (tx) => {
      // 5a. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PENDING',
          shippingAddress: shippingAddress || {},
          items: {
            create: lineItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, title: true, sku: true },
              },
            },
          },
        },
      });

      // 5b. Decrement stock for each product
      for (const li of lineItems) {
        await tx.product.update({
          where: { id: li.productId },
          data: { stockQuantity: { decrement: li.quantity } },
        });
      }

      return newOrder;
    });

    // 6. Respond ─────────────────────────────────────────────────────────────
    res.status(201).json({
      message: 'Order created successfully.',
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        items: order.items,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/orders/my-orders ─────────────────────────────────────────────────

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, title: true, imageUrls: true, sku: true },
            },
          },
        },
      },
    });

    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders };
