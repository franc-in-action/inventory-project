// backend/src/routes/issuedPayments.js
import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE PAYMENT ISSUED
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { vendorId, purchaseId, amount, method } = req.body;
    if (!vendorId && !purchaseId)
      return res.status(400).json({ error: "vendorId or purchaseId required" });
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Positive amount required" });

    try {
      const result = await prisma.$transaction(async (tx) => {
        if (vendorId) {
          const vendor = await tx.vendor.findUnique({
            where: { id: vendorId },
          });
          if (!vendor) throw new Error("Vendor not found");
        }

        const issuedPayment = await tx.issuedPayment.create({
          data: { vendorId, purchaseId, amount, method },
        });

        const ledgerEntry = await tx.ledgerEntry.create({
          data: {
            vendorId,
            purchaseId,
            paymentId: issuedPayment.id,
            type: "PAYMENT_ISSUED",
            amount,
            method,
            description: `Payment of ${amount} issued to vendor`,
          },
        });

        return { issuedPayment, ledgerEntry };
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const id = req.params.id;
    const { vendorId, purchaseId, amount, method } = req.body;
    if (!vendorId && !purchaseId)
      return res.status(400).json({ error: "vendorId or purchaseId required" });
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Positive amount required" });

    try {
      const result = await prisma.$transaction(async (tx) => {
        const issuedPayment = await tx.issuedPayment.update({
          where: { id },
          data: { vendorId, purchaseId, amount, method },
        });
        const ledgerEntry = await tx.ledgerEntry.findFirst({
          where: { paymentId: id, type: "PAYMENT_ISSUED" },
        });
        if (ledgerEntry)
          await tx.ledgerEntry.update({
            where: { id: ledgerEntry.id },
            data: { amount, method },
          });
        return { issuedPayment, ledgerEntry };
      });

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// GET ALL
router.get("/", authMiddleware, async (req, res) => {
  try {
    const payments = await prisma.issuedPayment.findMany({
      include: { vendor: true, purchase: true },
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ONE
router.get("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const payment = await prisma.issuedPayment.findUnique({
      where: { id },
      include: { vendor: true, purchase: true },
    });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const id = req.params.id;
    try {
      const result = await prisma.$transaction(async (tx) => {
        const issuedPayment = await tx.issuedPayment.delete({ where: { id } });
        await tx.ledgerEntry.deleteMany({
          where: { paymentId: id, type: "PAYMENT_ISSUED" },
        });
        return issuedPayment;
      });
      res.json({ message: "Issued payment deleted", deleted: result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
