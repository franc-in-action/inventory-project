import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// CREATE PURCHASE
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const { vendorId, locationId, items, purchaseUuid } = req.body;
    const userId = req.user.userId;

    if (!items?.length)
      return res.status(400).json({ error: "No items provided" });

    try {
      // Ensure vendor exists
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });
      if (!vendor) return res.status(400).json({ error: "Invalid vendor" });

      // ✅ Check that every product in items is linked to this vendor
      const notSupplied = [];
      for (const it of items) {
        const pv = await prisma.productVendor.findUnique({
          where: { productId_vendorId: { productId: it.productId, vendorId } },
        });
        if (!pv) notSupplied.push(it.productId);
      }
      if (notSupplied.length) {
        return res.status(400).json({
          error: `Products not supplied by this vendor: ${notSupplied.join(
            ", "
          )}`,
        });
      }

      const finalUuid = purchaseUuid || uuidv4();

      const existing = await prisma.purchase.findUnique({
        where: { purchaseUuid: finalUuid },
      });
      if (existing)
        return res
          .status(400)
          .json({ error: "Purchase with this UUID already exists" });

      const purchase = await prisma.$transaction(async (tx) => {
        const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);

        const newPurchase = await tx.purchase.create({
          data: {
            purchaseUuid: finalUuid,
            vendorId: parseInt(vendorId),
            locationId: parseInt(locationId),
            total,
          },
        });

        for (const item of items) {
          await tx.purchaseItem.create({
            data: {
              purchaseId: newPurchase.id,
              productId: parseInt(item.productId),
              qty: parseInt(item.qty),
              price: parseFloat(item.price),
            },
          });
        }

        await tx.auditLog.create({
          data: {
            action: "PURCHASE_CREATED",
            entity: "Purchase",
            entityId: newPurchase.id.toString(),
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

// RECEIVE PURCHASE
router.put(
  "/:id/receive",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const purchaseId = req.params.id; // keep as string
    const userId = req.user.userId;

    try {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { items: true },
      });
      if (!purchase)
        return res.status(404).json({ error: "Purchase not found" });
      if (purchase.received)
        return res.status(400).json({ error: "Purchase already received" });

      await prisma.$transaction(async (tx) => {
        await tx.purchase.update({
          where: { id: purchaseId },
          data: { received: true, receivedBy: userId }, // <-- add this
        });

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
              performedBy: userId,
            },
          });
        }

        await tx.auditLog.create({
          data: {
            action: "PURCHASE_RECEIVED",
            entity: "Purchase",
            entityId: purchaseId,
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

// GET PURCHASES WITH FILTERS
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
      if (productId) where.items = { some: { productId } }; // <--- remove parseInt

      const purchases = await prisma.purchase.findMany({
        where,
        include: {
          items: true,
          vendor: true,
          location: true,
          receivedByUser: true, // now works after generating client
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      let qtyPurchased = 0;
      let purchasesWithQty = purchases;
      if (productId) {
        purchasesWithQty = purchases.map((p) => {
          const product_qty = p.items
            .filter((it) => it.productId === parseInt(productId))
            .reduce((sum, it) => sum + it.qty, 0);
          qtyPurchased += product_qty;
          return { ...p, product_qty };
        });
      }

      const total = await prisma.purchase.count({ where });
      res.json(
        productId
          ? { purchases: purchasesWithQty, total, qtyPurchased }
          : { purchases: purchasesWithQty, total }
      );
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
