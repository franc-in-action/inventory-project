import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all products
router.get("/", authMiddleware, async (req, res) => {
    try {
        console.log("[GET /products] Fetching all products...");
        const products = await prisma.product.findMany({
            include: { category: true },
        });
        console.log(`[GET /products] Found ${products.length} products.`);
        res.json(products);
    } catch (err) {
        console.error("[GET /products] Error fetching products:", err);
        res.status(500).json({ error: err.message });
    }
});

// CREATE product
router.post("/", authMiddleware, requireRole(["ADMIN", "MANAGER"]), async (req, res) => {
    const { sku, name, description, price, quantity, categoryId, locationId } = req.body;
    console.log("[POST /products] Creating product with data:", req.body);
    try {
        const product = await prisma.product.create({
            data: { sku, name, description, price, quantity, categoryId, locationId },
        });
        console.log("[POST /products] Product created:", product);
        res.status(201).json(product);
    } catch (err) {
        console.error("[POST /products] Error creating product:", err);
        res.status(400).json({ error: err.message });
    }
});

// UPDATE product
router.put("/:id", authMiddleware, requireRole(["ADMIN", "MANAGER"]), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, quantity, categoryId } = req.body;
    console.log(`[PUT /products/${id}] Updating product with data:`, req.body);
    try {
        const product = await prisma.product.update({
            where: { id },
            data: { name, description, price, quantity, categoryId },
        });
        console.log(`[PUT /products/${id}] Product updated:`, product);
        res.json(product);
    } catch (err) {
        console.error(`[PUT /products/${id}] Error updating product:`, err);
        res.status(400).json({ error: err.message });
    }
});

// DELETE product
router.delete("/:id", authMiddleware, requireRole(["ADMIN", "MANAGER"]), async (req, res) => {
    const { id } = req.params;
    console.log(`[DELETE /products/${id}] Deleting product...`);
    try {
        await prisma.product.delete({ where: { id } });
        console.log(`[DELETE /products/${id}] Product deleted.`);
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error(`[DELETE /products/${id}] Error deleting product:`, err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
