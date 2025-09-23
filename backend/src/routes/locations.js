import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes in this router
router.use(authMiddleware);

// GET /api/locations – list all locations (requires valid JWT)
router.get("/", async (req, res, next) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" },
    });
    res.json(locations);
  } catch (err) {
    next(err);
  }
});

export default router;
