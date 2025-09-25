// backend/src/routes/vendors.js

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
    const { name, email, phone } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
      const vendor = await prisma.vendor.create({
        data: { name, email, phone },
      });
      res.status(201).json(vendor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- READ ALL --------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id; // <-- keep as string
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { productVendors: { include: { product: true } } },
    });

    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const id = req.params.id; // <-- keep as string
    const { name, email, phone } = req.body;

    try {
      const vendor = await prisma.vendor.update({
        where: { id },
        data: { name, email, phone },
      });
      res.json(vendor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const id = req.params.id; // <-- keep as string
    try {
      await prisma.vendor.delete({ where: { id } });
      res.json({ message: "Vendor deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Get Vendor products
router.get("/:id/products", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const products = await prisma.product.findMany({
      where: { productVendors: { some: { vendorId: id } } },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
