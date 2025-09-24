import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

/**
 * POST /api/purchases
 * Body: { vendorId, locationId, items: [{ productId, qty, price }] }
 */
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const { vendorId, locationId, items, purchaseUuid } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0)
      return res.status(400).json({ error: "No items provided" });

    try {
      const finalUuid = purchaseUuid || uuidv4();

      // Check if UUID already exists
      const existing = await prisma.purchase.findUnique({
        where: { purchaseUuid: finalUuid },
      });
      if (existing)
        return res
          .status(400)
          .json({ error: "Purchase with this UUID already exists" });

      const purchase = await prisma.$transaction(async (tx) => {
        // Calculate total
        const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);

        // Create purchase
        const newPurchase = await tx.purchase.create({
          data: {
            purchaseUuid: finalUuid,
            vendorId,
            locationId,
            total,
          },
        });

        // Create purchase items
        for (const item of items) {
          await tx.purchaseItem.create({
            data: {
              purchaseId: newPurchase.id,
              productId: item.productId,
              qty: item.qty,
              price: item.price,
            },
          });
        }

        // Audit log
        await tx.auditLog.create({
          data: {
            action: "PURCHASE_CREATED",
            entity: "Purchase",
            entityId: newPurchase.id.toString(), // <-- convert to string
            performedBy: userId,
            metadata: { items },
          },
        });

        return newPurchase;
      });

      res.status(201).json(purchase);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * PUT /api/purchases/:id/receive
 * Marks a purchase as received -> updates stock levels & creates stock movements
 */
router.put(
  "/:id/receive",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const purchaseId = parseInt(req.params.id);
    const userId = req.user.userId;

    try {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { items: true },
      });

      if (!purchase)
        return res.status(404).json({ error: "Purchase not found" });

      if (!purchase.purchaseUuid)
        return res
          .status(400)
          .json({ error: "Purchase UUID missing, cannot receive" });

      if (purchase.received)
        return res.status(400).json({ error: "Purchase already received" });

      await prisma.$transaction(async (tx) => {
        // Update purchase as received
        await tx.purchase.update({
          where: { id: purchaseId },
          data: { received: true },
        });

        // Update stock levels and create stock movements
        for (const item of purchase.items) {
          await tx.stockLevel.upsert({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: purchase.locationId,
              },
            },
            update: { quantity: { increment: item.qty } },
            create: {
              productId: item.productId,
              locationId: purchase.locationId,
              quantity: item.qty,
            },
          });

          await tx.stockMovement.create({
            data: {
              movementUuid: uuidv4(),
              productId: item.productId,
              locationId: purchase.locationId,
              delta: item.qty,
              reason: "Purchase Received",
              refId: purchase.purchaseUuid,
            },
          });
        }

        // Audit log
        await tx.auditLog.create({
          data: {
            action: "PURCHASE_RECEIVED",
            entity: "Purchase",
            entityId: purchaseId.toString(),
            performedBy: userId,
            metadata: { items: purchase.items },
          },
        });
      });

      const updatedPurchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
      });
      res.status(200).json(updatedPurchase);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// GET /api/purchases?locationId=1&vendorId=2&page=1&limit=10&productId=...
router.get(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const { locationId, vendorId, page = 1, limit = 10, productId } = req.query;

    try {
      const where = {};
      if (locationId) where.locationId = parseInt(locationId);
      if (vendorId) where.vendorId = parseInt(vendorId);

      if (productId) {
        // Return purchases that include the product
        where.items = { some: { productId } };
      }

      const purchases = await prisma.purchase.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      // If productId provided compute qtyPurchased
      let qtyPurchased = 0;
      if (productId) {
        for (const p of purchases) {
          for (const it of p.items) {
            if (it.productId === productId) qtyPurchased += it.qty;
          }
        }
      }

      const total = await prisma.purchase.count({ where });

      res.json(
        productId ? { purchases, total, qtyPurchased } : { purchases, total }
      );
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
