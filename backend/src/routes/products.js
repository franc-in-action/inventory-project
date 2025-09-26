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
      // prisma.product.findMany({
      // where,
      // include: { category: true, location: true },
      prisma.product.findMany({
        where,
        include: {
          category: true,
          location: true,
          productVendors: { include: { vendor: true } },
        },
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
        productVendors: { include: { vendor: true } },
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
    const {
      sku,
      name,
      description,
      price,
      categoryId,
      locationId,
      vendorIds = [],
    } = req.body;

    try {
      const product = await prisma.product.create({
        data: {
          sku,
          name,
          description,
          price,
          categoryId,
          locationId,
          productVendors: {
            create: vendorIds.map((vId) => ({ vendorId: vId })),
          },
        },
        include: {
          productVendors: { include: { vendor: true } },
        },
      });

      res.status(201).json(product);
    } catch (err) {
      console.error("[POST /products] Error creating product:", err);

      let friendlyMessage = "Failed to create product.";

      if (err.code === "P2002") {
        friendlyMessage = "A product with this SKU already exists.";
      }
      if (err.code === "P2003") {
        friendlyMessage =
          "Cannot create product because one of the selected vendors does not exist.";
      }

      res.status(400).json({ error: friendlyMessage });
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
    const { sku, name, description, price, categoryId, locationId, vendorIds } =
      req.body;

    try {
      const data = { sku, name, description, price, categoryId, locationId };

      // Only update vendors if vendorIds is provided
      if (vendorIds) {
        data.productVendors = {
          deleteMany: {}, // remove existing links
          create: vendorIds.map((vendorId) => ({ vendorId })),
        };
      }

      const product = await prisma.product.update({
        where: { id },
        data,
        include: {
          productVendors: { include: { vendor: true } },
        },
      });

      res.json(product);
    } catch (err) {
      console.error(`[PUT /products/${id}] Error updating product:`, err);

      let friendlyMessage = "Failed to update product.";

      if (err.code === "P2002") {
        friendlyMessage =
          "Cannot update: a product with this SKU already exists.";
      }
      if (err.code === "P2003") {
        friendlyMessage =
          "Cannot update product because one of the selected vendors does not exist.";
      }

      res.status(400).json({ error: friendlyMessage });
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
      res.json({ message: "Product deleted successfully." });
    } catch (err) {
      console.error(`[DELETE /products/${id}] Error deleting product:`, err);

      let friendlyMessage = "Failed to delete product.";

      // Prisma foreign key constraint error
      if (err.code === "P2003") {
        friendlyMessage =
          "Cannot delete this product because it is linked to existing records (e.g., stock, sales, or vendors).";
      }

      res.status(400).json({ error: friendlyMessage });
    }
  }
);


export default router;
