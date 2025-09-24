import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

/**
 * POST /api/sales
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

        const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

        const newSale = await tx.sale.create({
          data: {
            saleUuid: saleUuid || uuidv4(),
            locationId,
            customerId,
            total,
          },
        });

        for (const item of items) {
          await tx.saleItem.create({
            data: {
              saleId: newSale.id,
              productId: item.productId,
              qty: item.qty,
              price: item.price,
            },
          });

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

          await tx.stockLevel.update({
            where: {
              productId_locationId: { productId: item.productId, locationId },
            },
            data: { quantity: { decrement: item.qty } },
          });
        }

        if (payment && payment.amount > 0) {
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
          const customer = await tx.customer.findUnique({
            where: { id: customerId },
          });
          if (!customer) throw new Error("Customer not found");
          if (customer.balance + total > customer.credit_limit) {
            throw new Error("Credit limit exceeded");
          }
          await tx.customer.update({
            where: { id: customerId },
            data: { balance: { increment: total } },
          });
        }

        await tx.auditLog.create({
          data: {
            action: "SALE_CREATED",
            entity: "Sale",
            entityId: newSale.id.toString(),
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

      if (productId) {
        where.items = { some: { productId } };
      }

      const sales = await prisma.sale.findMany({
        where,
        include: { customer: true, items: true, payments: true },
        orderBy: { createdAt: "desc" },
      });

      let qtySold = 0;
      let salesWithQty = sales;
      if (productId) {
        salesWithQty = sales.map((s) => {
          const product_qty = s.items
            .filter((it) => it.productId === productId)
            .reduce((sum, it) => sum + it.qty, 0);
          qtySold += product_qty;
          return { ...s, product_qty };
        });
      }

      res.json(productId ? { sales: salesWithQty, qtySold } : salesWithQty);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
