import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// -------------------- CREATE PAYMENT --------------------
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const { customerId, amount, saleId, method } = req.body;

    if (!customerId && !saleId) {
      return res
        .status(400)
        .json({ error: "Either customerId or saleId is required" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Positive amount required" });
    }

    try {
      const payment = await prisma.$transaction(async (tx) => {
        // Fetch customer if provided
        let customer;
        if (customerId) {
          customer = await tx.customer.findUnique({
            where: { id: customerId },
          });
          if (!customer) throw new Error("Customer not found");
        }

        // Record payment
        const newPayment = await tx.payment.create({
          data: {
            saleId, // <-- just the foreign key
            amount,
            method,
            customerId,
          },
        });

        // Reduce customer balance if applicable
        if (customerId) {
          await tx.customer.update({
            where: { id: customerId },
            data: { balance: { decrement: amount } },
          });
        }

        // Return payment + updated customer
        const updatedCustomer = customerId
          ? await tx.customer.findUnique({ where: { id: customerId } })
          : null;

        return { ...newPayment, updatedCustomer };
      });

      res.status(201).json(payment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- GET ALL PAYMENTS --------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { sale: true, customer: true },
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET SINGLE PAYMENT --------------------
router.get("/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { sale: true, customer: true },
    });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
