// backend/src/routes/purchases.js
import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";
import { generateSequentialId } from "../utils/idGenerator.js";

const router = express.Router();

// -------------------- CREATE PURCHASE --------------------
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { locationId, vendorId, items, received, issuedPayment } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0)
      return res.status(400).json({ error: "No items provided" });
    if (!vendorId) return res.status(400).json({ error: "vendorId required" });

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Generate purchase number
        const purchaseNumber = await generateSequentialId("Purchase");

        const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
        const newPurchase = await tx.purchase.create({
          data: {
            purchaseUuid: purchaseNumber, // <-- use generated sequential ID
            locationId,
            vendorId,
            total,
            received: !!received,
            items: {
              create: items.map((i) => ({
                productId: i.productId,
                qty: i.qty,
                price: i.price,
              })),
            },
            receivedBy: received ? userId : null,
          },
        });

        // Update stock if received
        if (received) {
          for (const item of items) {
            const stockLevel = await tx.stockLevel.findUnique({
              where: {
                productId_locationId: { productId: item.productId, locationId },
              },
            });
            if (stockLevel) {
              await tx.stockLevel.update({
                where: { id: stockLevel.id },
                data: { quantity: stockLevel.quantity + item.qty },
              });
            } else {
              await tx.stockLevel.create({
                data: {
                  productId: item.productId,
                  locationId,
                  quantity: item.qty,
                },
              });
            }

            await tx.stockMovement.create({
              data: {
                movementUuid: uuidv4(),
                delta: item.qty,
                reason: "Purchase Received",
                refId: newPurchase.purchaseUuid,
                product: { connect: { id: item.productId } },
                location: { connect: { id: locationId } },
                user: { connect: { id: userId } },
              },
            });
          }
        }

        // Create ledger entry for PURCHASE
        await tx.ledgerEntry.create({
          data: {
            purchaseId: newPurchase.id,
            vendorId,
            type: "PURCHASE",
            amount: total,
            description: `Purchase from vendor`,
          },
        });

        // Handle optional issuedPayment
        let paymentRecord = null;
        if (issuedPayment?.amount > 0) {
          paymentRecord = await tx.issuedPayment.create({
            data: {
              purchaseId: newPurchase.id,
              vendorId,
              amount: issuedPayment.amount,
              method: issuedPayment.method,
            },
          });

          await tx.ledgerEntry.create({
            data: {
              purchaseId: newPurchase.id,
              vendorId,
              issuedPaymentId: paymentRecord.id,
              type: "PAYMENT_ISSUED",
              amount: issuedPayment.amount,
              method: issuedPayment.method,
              description: `Payment of ${issuedPayment.amount} issued to vendor`,
            },
          });
        }

        return { purchase: newPurchase, issuedPayment: paymentRecord };
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- GET ALL PURCHASES --------------------
router.get("/", authMiddleware, async (req, res) => {
  const { startDate, endDate, locationId, vendorId, productId } = req.query;
  try {
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (locationId) where.locationId = locationId;
    if (vendorId) where.vendorId = vendorId;
    if (productId) where.items = { some: { productId } };

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        items: true,
        vendor: true,
        ledger: true,
        receivedByUser: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET SINGLE PURCHASE --------------------
router.get("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        items: true,
        vendor: true,
        ledger: true,
        receivedByUser: true,
      },
    });
    if (!purchase) return res.status(404).json({ error: "Purchase not found" });
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- UPDATE PURCHASE --------------------
router.put(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const id = req.params.id;
    const { locationId, vendorId, received, items } = req.body;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const purchase = await tx.purchase.update({
          where: { id },
          data: { locationId, vendorId, received },
        });

        // Update items
        if (items) {
          for (const item of items) {
            await tx.purchaseItem.upsert({
              where: { id: item.id || 0 },
              create: {
                purchaseId: id,
                productId: item.productId,
                qty: item.qty,
                price: item.price,
              },
              update: { qty: item.qty, price: item.price },
            });
          }
        }

        return purchase;
      });

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

//  --------------------- RECEIVE PURCHASE
router.put(
  "/:id/receive",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const purchaseId = req.params.id;
    const userId = req.user.userId;

    try {
      const updatedPurchase = await prisma.$transaction(async (tx) => {
        // Mark purchase as received
        const purchase = await tx.purchase.update({
          where: { id: purchaseId },
          data: { received: true, receivedBy: userId },
          include: {
            items: true, // for stock updates
            receivedByUser: true, // ✅ include the user who received
          },
        });

        if (!purchase.items || purchase.items.length === 0) {
          throw new Error("Purchase has no items to receive");
        }

        // Update stock levels and create stock movements
        for (const item of purchase.items) {
          const stockLevel = await tx.stockLevel.findUnique({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: purchase.locationId,
              },
            },
          });

          if (stockLevel) {
            await tx.stockLevel.update({
              where: { id: stockLevel.id },
              data: { quantity: stockLevel.quantity + item.qty },
            });
          } else {
            await tx.stockLevel.create({
              data: {
                productId: item.productId,
                locationId: purchase.locationId,
                quantity: item.qty,
              },
            });
          }

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

        // Create ledger entry for PURCHASE
        await tx.ledgerEntry.create({
          data: {
            purchaseId: purchase.id,
            vendorId: purchase.vendorId,
            type: "PURCHASE",
            amount: purchase.total,
            description: `Purchase from vendor received`,
          },
        });

        return purchase;
      });

      res.json(updatedPurchase);
    } catch (err) {
      console.error("[Receive Purchase] Error:", err);
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- DELETE PURCHASE --------------------
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const id = req.params.id;
    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.ledgerEntry.deleteMany({ where: { purchaseId: id } });
        await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
        const purchase = await tx.purchase.delete({ where: { id } });
        return purchase;
      });

      res.json({ message: "Purchase deleted", deleted: result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
