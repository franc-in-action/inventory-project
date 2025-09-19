// routes/categories.js
import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

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

export default router;
