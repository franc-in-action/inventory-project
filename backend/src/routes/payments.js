// backend/src/routes/receivedPayments.js
import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// -------------------- CREATE PAYMENT RECEIVED --------------------
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const { customerId, saleId, amount, method } = req.body;

    if (!customerId && !saleId)
      return res.status(400).json({ error: "customerId or saleId required" });
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Positive amount required" });

    try {
      const result = await prisma.$transaction(async (tx) => {
        if (customerId) {
          const customer = await tx.customer.findUnique({
            where: { id: customerId },
          });
          if (!customer) throw new Error("Customer not found");
        }

        // Create ReceivedPayment
        const payment = await tx.receivedPayment.create({
          data: { customerId, saleId, amount, method },
        });

        // Create corresponding ledger entry
        const ledgerEntry = await tx.ledgerEntry.create({
          data: {
            customerId,
            saleId,
            receivedPaymentId: payment.id,
            type: "PAYMENT_RECEIVED",
            amount,
            method,
            description: `Payment of ${amount} received`,
          },
        });

        return { payment, ledgerEntry };
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- UPDATE PAYMENT RECEIVED --------------------
router.put(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const id = req.params.id;
    const { customerId, saleId, amount, method } = req.body;

    if (!customerId && !saleId)
      return res.status(400).json({ error: "customerId or saleId required" });
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Positive amount required" });

    try {
      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.receivedPayment.update({
          where: { id },
          data: { customerId, saleId, amount, method },
        });

        const ledgerEntry = await tx.ledgerEntry.findFirst({
          where: { receivedPaymentId: id, type: "PAYMENT_RECEIVED" },
        });

        if (ledgerEntry) {
          await tx.ledgerEntry.update({
            where: { id: ledgerEntry.id },
            data: { amount, method },
          });
        }

        return { payment, ledgerEntry };
      });

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- GET ALL PAYMENTS --------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const payments = await prisma.receivedPayment.findMany({
      include: { customer: true, sale: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET SINGLE PAYMENT --------------------
router.get("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const payment = await prisma.receivedPayment.findUnique({
      where: { id },
      include: { customer: true, sale: true },
    });

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- DELETE PAYMENT --------------------
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const id = req.params.id;
    try {
      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.receivedPayment.delete({ where: { id } });

        await tx.ledgerEntry.deleteMany({
          where: { receivedPaymentId: id, type: "PAYMENT_RECEIVED" },
        });

        return payment;
      });

      res.json({ message: "Payment deleted", deleted: result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
