// routes/users.js
import express from "express";
import bcrypt from "bcryptjs";
import fetch from "node-fetch"; // make sure node-fetch is installed
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// List users
router.get("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(users);
});

// Create user
router.post("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { name, email, role } = req.body;

  if (!["ADMIN", "MANAGER", "STAFF"].includes(role.toUpperCase())) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const defaultPassword = "ChangeMe123!";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role.toUpperCase(),
        password: hashedPassword,
      },
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error("Failed to create user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
router.put("/:id", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { name, role } = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, role: role.toUpperCase() },
  });
  res.json(updatedUser);
});

// Fallback local word list
const fallbackWords = [
  "Stomach",
  "Echo",
  "River",
  "Mountain",
  "Sky",
  "Tiger",
  "Apple",
  "Rocket",
  "Shadow",
  "Fire",
  "Stone",
  "Ocean",
  "Leaf",
  "Wolf",
  "Sun",
  "Moon",
];
function randomLocalPassphrase() {
  const w1 = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
  const w2 = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
  const w3 = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
  return `${w1}-${w2}-${w3}`;
}

// List of online passphrase APIs (most reliable first)
const passphraseAPIs = [
  "https://api.passphrases.dev/3",
  "https://random-word-api.herokuapp.com/word?number=3",
  "https://random-word-api.vercel.app/api?words=3",
  "https://api.noopschallenge.com/wordbank?count=3",
  "https://randommer.io/api/Word?quantity=3",
  "https://makemeapassword.ligos.net/api/v1/passphrase?count=3",
];

// Function to try APIs in order
async function fetchOnlinePassphrase() {
  for (const url of passphraseAPIs) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;

      const data = await resp.json();
      let wordsArray;

      // Normalize different API responses
      if (Array.isArray(data)) wordsArray = data;
      else if (data.words) wordsArray = data.words;
      else if (data.passphrase) wordsArray = data.passphrase.split("-");
      else continue;

      if (wordsArray.length >= 3) {
        return wordsArray.slice(0, 3).join("-");
      }
    } catch (err) {
      console.warn(`Failed to fetch from ${url}: ${err.message}`);
      continue;
    }
  }
  // Fallback to local generation
  return randomLocalPassphrase();
}

// Reset user password
router.post(
  "/:id/reset-password",
  authMiddleware,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const newPassword = await fetchOnlinePassphrase();
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: req.params.id },
        data: { password: hashedPassword },
      });

      res.json({ message: "Password reset successfully", newPassword });
    } catch (err) {
      console.error("Failed to reset password:", err);
      res.status(500).json({ error: "Failed to reset password" });
    }
  }
);

export default router;
