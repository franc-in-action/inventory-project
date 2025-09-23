// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post("/register", async (req, res) => {
  //console.log("[REGISTER] Body received:", req.body);

  try {
    const { email, password, name, role, locationId } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role, locationId },
    });

    //console.log("[REGISTER] User created:", user);
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error("[REGISTER] Error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  //console.log("[LOGIN] Body received:", req.body);
  //console.log("[LOGIN] JWT_SECRET:", JWT_SECRET);

  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.warn("[LOGIN] User not found for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Log DB hash and incoming password
    //console.log("[LOGIN] Password from request:", password);
    //console.log("[LOGIN] Hashed password in DB:", user.password);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.warn("[LOGIN] Invalid password for user:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    //console.log("[LOGIN] Token generated for user:", email);
    res.json({ token });
  } catch (err) {
    console.error("[LOGIN] Error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
