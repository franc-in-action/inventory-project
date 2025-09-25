import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// -------------------- CREATE ADJUSTMENT --------------------
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { customerId, amount, method, description } = req.body;
    const userId = req.user.userId;

    if (!customerId || !amount || amount === 0) {
      return res
        .status(400)
        .json({ error: "Customer and non-zero amount required" });
    }

    try {
      const adjustment = await prisma.ledgerEntry.create({
        data: {
          customerId,
          amount,
          method,
          type: "ADJUSTMENT",
          description: description || `Manual adjustment of ${amount}`,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: "ADJUSTMENT_CREATED",
          entity: "LedgerEntry",
          entityId: adjustment.id,
          performedBy: userId,
          metadata: { amount, method, description },
        },
      });

      res.status(201).json(adjustment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
