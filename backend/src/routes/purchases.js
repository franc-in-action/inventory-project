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

    if (!items?.length)
      return res.status(400).json({ error: "No items provided" });
    if (!vendorId) return res.status(400).json({ error: "vendorId required" });

    try {
      const result = await prisma.$transaction(async (tx) => {
        const purchaseNumber = await generateSequentialId("Purchase");
        const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

        const newPurchase = await tx.purchase.create({
          data: {
            purchaseUuid: purchaseNumber,
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

        await tx.ledgerEntry.create({
          data: {
            purchaseId: newPurchase.id,
            vendorId,
            type: "PURCHASE",
            amount: total,
            description: `Purchase from vendor`,
          },
        });

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

// -------------------- GET PAGINATED PURCHASES --------------------
router.get("/", authMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  try {
    const { startDate, endDate, locationId, vendorId, productId } = req.query;

    const where = {};
    if (startDate || endDate) where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
    if (locationId) where.locationId = locationId;
    if (vendorId) where.vendorId = vendorId;
    if (productId) where.items = { some: { productId } };

    const [total, items] = await prisma.$transaction([
      prisma.purchase.count({ where }),
      prisma.purchase.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          items: true,
          vendor: true,
          ledger: true,
          receivedByUser: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      data: items,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET SINGLE PURCHASE --------------------
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: req.params.id },
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
    const { locationId, vendorId, received, items } = req.body;
    try {
      const result = await prisma.$transaction(async (tx) => {
        const data = {};
        if (locationId) data.location = { connect: { id: locationId } };
        if (vendorId) data.vendor = { connect: { id: vendorId } };
        if (typeof received === "boolean") data.received = received;

        const purchase = await tx.purchase.update({
          where: { id: req.params.id },
          data,
          include: { items: true },
        });

        if (items) {
          const existingItemsMap = Object.fromEntries(
            purchase.items.map((i) => [i.id, i])
          );
          const newItemIds = [];

          for (const item of items) {
            if (item.id && existingItemsMap[item.id]) {
              await tx.purchaseItem.update({
                where: { id: item.id },
                data: {
                  qty: item.qty,
                  price: item.price,
                  productId: item.productId,
                },
              });
              newItemIds.push(item.id);
            } else {
              const newItem = await tx.purchaseItem.create({
                data: {
                  purchaseId: req.params.id,
                  productId: item.productId,
                  qty: item.qty,
                  price: item.price,
                },
              });
              newItemIds.push(newItem.id);
            }
          }

          const toDelete = purchase.items
            .filter((i) => !newItemIds.includes(i.id))
            .map((i) => i.id);
          if (toDelete.length)
            await tx.purchaseItem.deleteMany({
              where: { id: { in: toDelete } },
            });
        }

        return purchase;
      });

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- RECEIVE PURCHASE --------------------
router.put(
  "/:id/receive",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const purchaseId = req.params.id;
    const userId = req.user.userId;

    try {
      const updatedPurchase = await prisma.$transaction(async (tx) => {
        const purchase = await tx.purchase.update({
          where: { id: purchaseId },
          data: { received: true, receivedBy: userId },
          include: { items: true, receivedByUser: true },
        });

        if (!purchase.items.length)
          throw new Error("Purchase has no items to receive");

        for (const item of purchase.items) {
          const stockLevel = await tx.stockLevel.findUnique({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: purchase.locationId,
              },
            },
          });

          if (stockLevel)
            await tx.stockLevel.update({
              where: { id: stockLevel.id },
              data: { quantity: stockLevel.quantity + item.qty },
            });
          else
            await tx.stockLevel.create({
              data: {
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

        await tx.ledgerEntry.create({
          data: {
            purchaseId: purchase.id,
            vendorId: purchase.vendorId,
            type: "PURCHASE",
            amount: purchase.total,
            description: "Purchase from vendor received",
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
    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.ledgerEntry.deleteMany({
          where: { purchaseId: req.params.id },
        });
        await tx.purchaseItem.deleteMany({
          where: { purchaseId: req.params.id },
        });
        return await tx.purchase.delete({ where: { id: req.params.id } });
      });
      res.json({ message: "Purchase deleted", deleted: result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
