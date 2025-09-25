import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// -------------------- CREATE SALE --------------------
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const { saleUuid, locationId, customerId, items, payment } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Check stock availability
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

        // Create sale
        const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
        const newSale = await tx.sale.create({
          data: {
            saleUuid: saleUuid || uuidv4(),
            locationId,
            customerId,
            total,
          },
        });

        // Create sale items & update stock
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
              delta: -item.qty,
              reason: "Sale",
              refId: newSale.saleUuid,
              product: { connect: { id: item.productId } },
              location: { connect: { id: locationId } },
              user: { connect: { id: userId } },
            },
          });

          await tx.stockLevel.update({
            where: {
              productId_locationId: { productId: item.productId, locationId },
            },
            data: { quantity: { decrement: item.qty } },
          });
        }

        // Create ledger entry for sale
        if (customerId) {
          await tx.ledgerEntry.create({
            data: {
              customerId,
              saleId: newSale.id,
              amount: total,
              type: "SALE",
              description: `Sale of ${total} to customer`,
            },
          });
        }

        // Handle payment (if any)
        if (payment?.amount > 0) {
          const paymentRecord = await tx.payment.create({
            data: {
              saleId: newSale.id,
              amount: payment.amount,
              method: payment.method,
              customerId,
            },
          });

          if (customerId) {
            await tx.ledgerEntry.create({
              data: {
                customerId,
                saleId: newSale.id,
                amount: payment.amount,
                method: payment.method,
                type: "PAYMENT_RECEIVED",
                description: `Payment of ${payment.amount} received`,
              },
            });
          }
        }

        // Audit log
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

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- GET SALES --------------------
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
      if (customerId) where.customerId = customerId;
      if (productId) where.items = { some: { productId } };

      const sales = await prisma.sale.findMany({
        where,
        include: { customer: true, items: true, payments: true },
        orderBy: { createdAt: "desc" },
      });

      // Optional: total quantity sold of productId
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
