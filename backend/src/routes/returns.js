import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";
import { generateSequentialId } from "../utils/idGenerator.js";

const router = express.Router();

// -------------------- CREATE RETURN --------------------
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER", "STAFF"]),
  async (req, res) => {
    const { saleId, items, customerId } = req.body;
    const userId = req.user.userId;

    if (!saleId || !items?.length) {
      return res.status(400).json({ error: "Sale and items are required" });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
          where: { id: saleId },
          include: { items: true },
        });
        if (!sale) throw new Error("Sale not found");

        // Validate return quantities
        for (const item of items) {
          const soldItem = sale.items.find(
            (i) => i.productId === item.productId
          );
          if (!soldItem)
            throw new Error(`Product ${item.productId} not in sale`);
          if (item.qty > soldItem.qty)
            throw new Error(
              `Return qty exceeds sold qty for ${item.productId}`
            );
        }

        const returnUuid = await generateSequentialId("Return");
        let totalAmount = 0;

        for (const item of items) {
          const soldItem = sale.items.find(
            (i) => i.productId === item.productId
          );
          const amount = item.qty * soldItem.price;
          totalAmount += amount;

          // Ledger entry
          if (customerId) {
            await tx.ledgerEntry.create({
              data: {
                customerId,
                saleId,
                amount,
                type: "RETURN",
                description: `Return of ${item.qty} x ${item.productId}`,
              },
            });
          }

          // Restock
          await tx.stockLevel.update({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: sale.locationId,
              },
            },
            data: { quantity: { increment: item.qty } },
          });

          // Stock movement
          await tx.stockMovement.create({
            data: {
              movementUuid: uuidv4(),
              delta: item.qty,
              reason: "Return",
              refId: sale.saleUuid,
              productId: item.productId,
              locationId: sale.locationId,
              performedBy: userId,
            },
          });
        }

        // Create return record
        const newReturn = await tx.return.create({
          data: {
            returnUuid,
            saleId,
            customerId,
            totalAmount,
            items: {
              create: items.map((i) => ({
                productId: i.productId,
                qty: i.qty,
                price: i.price,
              })),
            },
          },
          include: { items: true },
        });

        // Audit
        await tx.auditLog.create({
          data: {
            action: "RETURN_CREATED",
            entity: "Return",
            entityId: newReturn.id,
            performedBy: userId,
            metadata: { items, totalAmount },
          },
        });

        return newReturn;
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- GET ALL RETURNS --------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const returns = await prisma.return.findMany({
      include: { items: true, customer: true },
    });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET RETURN BY ID --------------------
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const returnRecord = await prisma.return.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });
    if (!returnRecord)
      return res.status(404).json({ error: "Return not found" });
    res.json(returnRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
