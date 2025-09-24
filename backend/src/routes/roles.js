// routes/roles.js
import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all users with roles
router.get("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });

  res.json(
    users.map((user) => ({
      id: user.id,
      userName: user.name,
      roleName: user.role,
    }))
  );
});

// PUT update role
router.put("/:id", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { role } = req.body;

  if (!["ADMIN", "MANAGER", "STAFF"].includes(role.toUpperCase())) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: role.toUpperCase() },
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("Failed to update role:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
});

export default router;
