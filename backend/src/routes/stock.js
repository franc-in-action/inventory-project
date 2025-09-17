import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/stock/movements
 * Body: { movementUuid, productId, locationId, delta, reason, refId }
 */
// Ensure locationId and productId are strings
router.post(
  "/movements",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { movementUuid, productId, locationId, delta, reason, refId } =
      req.body;
    const userId = req.user.userId;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.stockMovement.findUnique({
          where: { movementUuid },
        });
        if (existing) return existing;

        const movement = await tx.stockMovement.create({
          data: { movementUuid, productId, locationId, delta, reason, refId },
        });

        const stockLevel = await tx.stockLevel.upsert({
          where: { productId_locationId: { productId, locationId } },
          update: { quantity: { increment: delta } },
          create: { productId, locationId, quantity: delta },
        });

        await tx.auditLog.create({
          data: {
            action: "STOCK_MOVEMENT",
            entity: "StockMovement",
            entityId: movement.id,
            performedBy: userId,
            metadata: { delta, reason, refId },
          },
        });

        return movement;
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
