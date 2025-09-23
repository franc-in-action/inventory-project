// backend/routes/locations.js
import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// GET all locations
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

// GET location by ID
router.get("/:id", async (req, res, next) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
    });
    res.json(location);
  } catch (err) {
    next(err);
  }
});

// POST create new location
router.post("/", async (req, res, next) => {
  try {
    const { name, address } = req.body;
    const newLocation = await prisma.location.create({
      data: { name, address },
    });
    res.json(newLocation);
  } catch (err) {
    next(err);
  }
});

// PUT update location
router.put("/:id", async (req, res, next) => {
  try {
    const { name, address } = req.body;
    const updatedLocation = await prisma.location.update({
      where: { id: req.params.id },
      data: { name, address },
    });
    res.json(updatedLocation);
  } catch (err) {
    next(err);
  }
});

// DELETE location
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

//
