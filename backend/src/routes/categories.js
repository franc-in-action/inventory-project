// routes/categories.js
import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Utility to parse Prisma errors
function handlePrismaError(err) {
  if (err.code === "P2002") {
    return {
      status: 400,
      message: "A category with this name already exists.",
    };
  }
  if (err.code === "P2025") {
    return { status: 404, message: "Category not found." };
  }
  return { status: 500, message: "Internal server error." };
}

// GET all categories
router.get("/", authMiddleware, async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    console.error("[GET /categories] Error:", err);
    const { status, message } = handlePrismaError(err);
    res.status(status).json({ error: message });
  }
});

// CREATE a new category
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name is required." });
    }
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (err) {
    console.error("[POST /categories] Error:", err);
    const { status, message } = handlePrismaError(err);
    res.status(status).json({ error: message });
  }
});

// UPDATE a category by ID
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name is required." });
    }
    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });
    res.json(category);
  } catch (err) {
    console.error(`[PUT /categories/${req.params.id}] Error:`, err);
    const { status, message } = handlePrismaError(err);
    res.status(status).json({ error: message });
  }
});

// DELETE a category by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(`[DELETE /categories/${req.params.id}] Error:`, err);
    const { status, message } = handlePrismaError(err);
    res.status(status).json({ error: message });
  }
});

export default router;
