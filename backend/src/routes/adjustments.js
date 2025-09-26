import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE adjustment
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

// GET all adjustments
router.get("/", authMiddleware, async (req, res) => {
  try {
    const adjustments = await prisma.ledgerEntry.findMany({
      where: { type: "ADJUSTMENT" },
    });
    res.json(adjustments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single adjustment by ID
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const adjustment = await prisma.ledgerEntry.findUnique({ where: { id } });
    if (!adjustment) return res.status(404).json({ error: "Not found" });
    res.json(adjustment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE adjustment
router.put(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { id } = req.params;
    const { customerId, amount, method, description } = req.body;
    try {
      const adjustment = await prisma.ledgerEntry.update({
        where: { id },
        data: { customerId, amount, method, description },
      });

      res.json(adjustment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// DELETE adjustment
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.ledgerEntry.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
