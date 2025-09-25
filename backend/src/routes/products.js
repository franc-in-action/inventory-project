// backend/src/routes/products.js

import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all products
router.get("/", authMiddleware, async (req, res) => {
  const {
    search = "",
    categoryId,
    locationId,
    page = 1,
    limit = 10,
  } = req.query;

  const filters = [];

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (categoryId) filters.push({ categoryId });
  if (locationId) filters.push({ locationId });

  const where = filters.length ? { AND: filters } : {};

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, location: true },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total });
  } catch (err) {
    console.error("[GET /products] Error fetching products:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET single product by id
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
      },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(`[GET /products/${id}] Error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// CREATE product
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { sku, name, description, price, categoryId, locationId } = req.body;
    try {
      const product = await prisma.product.create({
        data: { sku, name, description, price, categoryId, locationId },
      });
      res.status(201).json(product);
    } catch (err) {
      console.error("[POST /products] Error creating product:", err);
      res.status(400).json({ error: err.message });
    }
  }
);

// UPDATE product
router.put(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { id } = req.params;
    const { sku, name, description, price, categoryId, locationId } = req.body;
    try {
      const product = await prisma.product.update({
        where: { id },
        data: { sku, name, description, price, categoryId, locationId },
      });
      res.json(product);
    } catch (err) {
      console.error(`[PUT /products/${id}] Error updating product:`, err);
      res.status(400).json({ error: err.message });
    }
  }
);

// DELETE product
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.product.delete({ where: { id } });
      res.json({ message: "Deleted" });
    } catch (err) {
      console.error(`[DELETE /products/${id}] Error deleting product:`, err);
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
