import express from "express";
import { prisma } from "../prisma.js";
import fs from "fs";
import path from "path";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Backup / Restore ---

// Create backup and send file for download
router.post(
  "/backup",
  authMiddleware,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const backupData = await prisma.$transaction([
        prisma.user.findMany(),
        prisma.product.findMany(),
        prisma.category.findMany(),
        prisma.stockLevel.findMany(),
        prisma.sale.findMany(),
        prisma.purchase.findMany(),
      ]);

      const backupJson = JSON.stringify(backupData, null, 2);
      const fileName = `backup-${Date.now()}.json`;

      // Send as downloadable file
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Type", "application/json");
      res.send(backupJson);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Backup failed" });
    }
  }
);

// Restore backup (remains same)
router.post(
  "/backup/restore",
  authMiddleware,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      if (!req.files || !req.files.file)
        return res.status(400).json({ error: "No file uploaded" });
      const backup = req.files.file.data.toString();
      const jsonData = JSON.parse(backup);

      // WARNING: delete existing data
      await prisma.$transaction([
        prisma.sale.deleteMany(),
        prisma.purchase.deleteMany(),
        prisma.stockLevel.deleteMany(),
        prisma.product.deleteMany(),
        prisma.category.deleteMany(),
        prisma.user.deleteMany(),
      ]);

      for (const user of jsonData[0]) await prisma.user.create({ data: user });
      for (const product of jsonData[1])
        await prisma.product.create({ data: product });
      for (const category of jsonData[2])
        await prisma.category.create({ data: category });
      for (const stock of jsonData[3])
        await prisma.stockLevel.create({ data: stock });
      for (const sale of jsonData[4]) await prisma.sale.create({ data: sale });
      for (const purchase of jsonData[5])
        await prisma.purchase.create({ data: purchase });

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Restore failed" });
    }
  }
);

export default router;
