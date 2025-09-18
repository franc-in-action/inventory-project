// routes/customers.js

import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// -------------------- CREATE --------------------
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { name, email, phone, credit_limit } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
      const customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone,
          credit_limit: credit_limit || 0,
        },
      });
      res.status(201).json(customer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- READ ALL --------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- READ ONE --------------------
router.get("/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- UPDATE --------------------
router.put(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, email, phone, credit_limit } = req.body;

    try {
      const customer = await prisma.customer.update({
        where: { id },
        data: { name, email, phone, credit_limit },
      });
      res.json(customer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- DELETE --------------------
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await prisma.customer.delete({ where: { id } });
      res.json({ message: "Customer deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
