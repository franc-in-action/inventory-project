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
            throw new Error(`Insufficient stock for product ${item.productId}`);
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

        // Create payment if provided
        if (payment && payment.amount > 0) {
          await tx.payment.create({
            data: {
              saleId: newSale.id,
              amount: payment.amount,
              method: payment.method,
            },
          });

          // Reduce customer balance if on credit
          await tx.customer.update({
            where: { id: customerId },
            data: { balance: { decrement: payment.amount } },
          });
        }

        // Create audit log
        await tx.auditLog.create({
          data: {
            action: "SALE_CREATED",
            entity: "Sale",
            entityId: newSale.id,
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

export default router;
