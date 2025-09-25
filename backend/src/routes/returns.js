import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// -------------------- CREATE RETURN --------------------
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const { saleId, items, customerId } = req.body;
    const userId = req.user.userId;

    if (!saleId || !items || items.length === 0) {
      return res.status(400).json({ error: "Sale and items are required" });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
          where: { id: saleId },
          include: { items: true, customer: true },
        });
        if (!sale) throw new Error("Sale not found");

        // Validate return quantities
        for (const item of items) {
          const originalItem = sale.items.find(
            (i) => i.productId === item.productId
          );
          if (!originalItem)
            throw new Error(`Product ${item.productId} not in sale`);
          if (item.qty > originalItem.qty)
            throw new Error(
              `Return quantity exceeds sold quantity for product ${item.productId}`
            );
        }

        // Process return: create ledger entries & optionally restock
        let totalReturnAmount = 0;
        for (const item of items) {
          const originalItem = sale.items.find(
            (i) => i.productId === item.productId
          );
          const amount = item.qty * originalItem.price;
          totalReturnAmount += amount;

          // Create ledger entry
          if (customerId) {
            await tx.ledgerEntry.create({
              data: {
                customerId,
                saleId,
                amount,
                type: "RETURN",
                description: `Return of ${item.qty} x ${originalItem.productId} from sale`,
              },
            });
          }

          // Restock product
          await tx.stockLevel.update({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: sale.locationId,
              },
            },
            data: { quantity: { increment: item.qty } },
          });

          await tx.stockMovement.create({
            data: {
              movementUuid: uuidv4(),
              delta: item.qty,
              reason: "Return",
              refId: sale.saleUuid,
              product: { connect: { id: item.productId } },
              location: { connect: { id: sale.locationId } },
              user: { connect: { id: userId } },
            },
          });
        }

        // Audit log
        await tx.auditLog.create({
          data: {
            action: "RETURN_CREATED",
            entity: "Sale",
            entityId: saleId,
            performedBy: userId,
            metadata: { items, totalReturnAmount },
          },
        });

        return { saleId, totalReturnAmount };
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
