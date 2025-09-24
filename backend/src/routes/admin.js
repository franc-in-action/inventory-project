import express from "express";
import { prisma } from "../prisma.js";
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
        prisma.saleItem.findMany(),
        prisma.purchase.findMany(),
        prisma.purchaseItem.findMany(),
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
      console.error("Backup failed:", err);
      res.status(500).json({ error: "Backup failed" });
    }
  }
);

// Restore backup (with proper FK order)
router.post(
  "/backup/restore",
  authMiddleware,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      if (!req.files || !req.files.file)
        return res.status(400).json({ error: "No file uploaded" });

      const backupFile = req.files.file;
      const backup = backupFile.data.toString("utf-8");
      const [
        users,
        products,
        categories,
        stockLevels,
        sales,
        saleItems,
        purchases,
        purchaseItems,
      ] = JSON.parse(backup);

      // Delete in child-first order to satisfy FK constraints
      await prisma.$transaction([
        prisma.purchaseItem.deleteMany(),
        prisma.purchase.deleteMany(),
        prisma.saleItem.deleteMany(),
        prisma.sale.deleteMany(),
        prisma.stockLevel.deleteMany(),
        prisma.product.deleteMany(),
        prisma.category.deleteMany(),
        prisma.user.deleteMany(),
      ]);

      // Restore in parent-first order
      for (const user of users) await prisma.user.create({ data: user });
      for (const category of categories)
        await prisma.category.create({ data: category });
      for (const product of products)
        await prisma.product.create({ data: product });
      for (const stock of stockLevels)
        await prisma.stockLevel.create({ data: stock });
      for (const sale of sales) await prisma.sale.create({ data: sale });
      for (const purchase of purchases)
        await prisma.purchase.create({ data: purchase });
      for (const saleItem of saleItems)
        await prisma.saleItem.create({ data: saleItem });
      for (const purchaseItem of purchaseItems)
        await prisma.purchaseItem.create({ data: purchaseItem });

      res.json({ ok: true });
    } catch (err) {
      console.error("Restore failed:", err);
      res.status(500).json({ error: "Restore failed" });
    }
  }
);

export default router;
