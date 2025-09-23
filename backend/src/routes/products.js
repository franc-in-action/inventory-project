import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all products
router.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        location: true, // ✅ include location so we can display location.name
      },
    });
    res.json(products);
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
        location: true, // ✅ include location name for single product too
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
    const { sku, name, description, price, quantity, categoryId, locationId } =
      req.body;
    try {
      const product = await prisma.product.create({
        data: {
          sku,
          name,
          description,
          price,
          quantity,
          categoryId,
          locationId,
        },
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
    const { name, description, price, quantity, categoryId, locationId } =
      req.body;
    try {
      const product = await prisma.product.update({
        where: { id },
        data: { name, description, price, quantity, categoryId, locationId },
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
