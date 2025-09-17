import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// List all users (admin only)
router.get("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
    res.json(users);
});

// Update user (admin only)
router.put("/:id", authMiddleware, requireRole("ADMIN"), async (req, res) => {
    const { name, role } = req.body;
    const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { name, role }
    });
    res.json(user);
});

export default router;
