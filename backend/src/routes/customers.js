import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { computeCustomerBalances } from "../utils/customersHelpers.js";

const router = express.Router();

// -------------------- CREATE CUSTOMER --------------------
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { name, email, phone, credit_limit } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
      const customer = await prisma.customer.create({
        data: { name, email, phone, credit_limit: credit_limit || 0 },
      });
      res.status(201).json(customer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- READ ALL CUSTOMERS WITH PAGINATION --------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const includeBalance = req.query.includeBalance === "true";
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const totalCustomers = await prisma.customer.count();
    const customers = await prisma.customer.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: "asc" },
    });

    if (!includeBalance) {
      return res.json({
        data: customers,
        meta: {
          total: totalCustomers,
          page,
          pageSize,
          totalPages: Math.ceil(totalCustomers / pageSize),
        },
      });
    }

    // Compute balances dynamically from ledger
    const balanceMap = await computeCustomerBalances(
      customers.map((c) => c.id)
    );
    const customersWithBalance = customers.map((c) => ({
      ...c,
      balance: balanceMap[c.id] || 0,
    }));

    res.json({
      data: customersWithBalance,
      meta: {
        total: totalCustomers,
        page,
        pageSize,
        totalPages: Math.ceil(totalCustomers / pageSize),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- READ SINGLE CUSTOMER --------------------
router.get("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: { include: { payments: true }, orderBy: { createdAt: "desc" } },
        receivedPayments: true, // FIXED: was `payments: true`
        ledger: true,
      },
    });

    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const balanceMap = await computeCustomerBalances(id);
    const balance = balanceMap[id] || 0;

    res.json({ ...customer, balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- UPDATE CUSTOMER --------------------
router.put(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const id = req.params.id;
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

// -------------------- DELETE CUSTOMER --------------------
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const id = req.params.id;
    try {
      await prisma.customer.delete({ where: { id } });
      res.json({ message: "Customer deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
