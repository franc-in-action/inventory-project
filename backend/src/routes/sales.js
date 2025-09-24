import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

/**
 * POST /api/sales
 * Body: { saleUuid, locationId, customerId, items: [{productId, qty, price}], payment }
 */
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const { saleUuid, locationId, customerId, items, payment } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0)
      return res.status(400).json({ error: "No items provided" });

    try {
      const sale = await prisma.$transaction(async (tx) => {
        // Check stock availability before creating sale
        for (const item of items) {
          const stockLevel = await tx.stockLevel.findUnique({
            where: {
              productId_locationId: { productId: item.productId, locationId },
            },
          });

          if (!stockLevel || stockLevel.quantity < item.qty) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });
            throw new Error(
              `Insufficient stock for product "${product?.name}"`
            );
          }
        }

        // Calculate total amount
        const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

        // Create sale record
        const newSale = await tx.sale.create({
          data: {
            saleUuid: saleUuid || uuidv4(),
            locationId,
            customerId,
            total,
          },
        });

        // Create sale items and update stock
        for (const item of items) {
          // Create sale item
          await tx.saleItem.create({
            data: {
              saleId: newSale.id,
              productId: item.productId,
              qty: item.qty,
              price: item.price,
            },
          });

          // Create stock movement
          await tx.stockMovement.create({
            data: {
              movementUuid: uuidv4(),
              productId: item.productId,
              locationId,
              delta: -item.qty,
              reason: "Sale",
              refId: newSale.saleUuid,
            },
          });

          // Decrement stock level
          await tx.stockLevel.update({
            where: {
              productId_locationId: { productId: item.productId, locationId },
            },
            data: { quantity: { decrement: item.qty } },
          });
        }

        // Create payment or update customer balance
        if (payment && payment.amount > 0) {
          // Payment provided: reduce customer balance
          await tx.payment.create({
            data: {
              saleId: newSale.id,
              amount: payment.amount,
              method: payment.method,
            },
          });

          await tx.customer.update({
            where: { id: customerId },
            data: { balance: { decrement: payment.amount } },
          });
        } else if (customerId) {
          // Sale on credit: increase customer balance
          const customer = await tx.customer.findUnique({
            where: { id: customerId },
          });
          if (!customer) throw new Error("Customer not found");

          // Check credit limit
          if (customer.balance + total > customer.credit_limit) {
            throw new Error("Credit limit exceeded");
          }

          await tx.customer.update({
            where: { id: customerId },
            data: { balance: { increment: total } },
          });
        }

        // Create audit log
        await tx.auditLog.create({
          data: {
            action: "SALE_CREATED",
            entity: "Sale",
            entityId: newSale.id.toString(), // convert Int → String
            performedBy: userId,
            metadata: { items, payment },
          },
        });

        return newSale;
      });

      res.status(201).json(sale);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// GET /api/sales?startDate=&endDate=&locationId=&customerId=&productId=
router.get(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const { startDate, endDate, locationId, customerId, productId } = req.query;

    try {
      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      if (locationId) where.locationId = locationId;
      if (customerId) where.customerId = parseInt(customerId);

      // If productId is present, we want sales that include at least one SaleItem for that product
      if (productId) {
        where.items = { some: { productId } };
      }

      const sales = await prisma.sale.findMany({
        where,
        include: { customer: true, items: true, payments: true },
        orderBy: { createdAt: "desc" },
      });

      // If productId provided compute aggregated qtySold for that product
      let qtySold = 0;
      if (productId) {
        for (const s of sales) {
          for (const si of s.items) {
            if (si.productId === productId) qtySold += si.qty;
          }
        }
      }

      res.json(productId ? { sales, qtySold } : sales);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
