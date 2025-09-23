// routes/categories.js
import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    console.error("[GET /categories] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create a new category
router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({ data: { name } });
  res.status(201).json(category);
});

export default router;
