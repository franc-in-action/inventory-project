import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { generateSequentialId } from "../utils/idGenerator.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// -------------------- GET SALES --------------------
router.get("/", authMiddleware, async (req, res) => {
  const { startDate, endDate, locationId, customerId, productId, status } =
    req.query;

  try {
    const where = {};

    // filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // filter by location / customer
    if (locationId) where.locationId = locationId;
    if (customerId) where.customerId = customerId;

    // filter by product
    if (productId) {
      where.items = { some: { productId } };
    }

    // filter by status (COMPLETE, PENDING, CANCELLED)
    if (status) {
      where.status = status.toUpperCase();
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Optional: total quantity sold of productId
    let qtySold = 0;
    let salesWithQty = sales;
    if (productId) {
      salesWithQty = sales.map((s) => {
        const product_qty = s.items
          .filter((it) => it.productId === productId)
          .reduce((sum, it) => sum + it.qty, 0);
        qtySold += product_qty;
        return { ...s, product_qty };
      });
    }

    res.json(productId ? { sales: salesWithQty, qtySold } : salesWithQty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- FINALIZE DRAFT --------------------
router.put("/:id/finalize", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { payment } = req.body;
  const userId = req.user.userId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const draft = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!draft || draft.status !== "PENDING") {
        throw new Error("Draft not found");
      }

      // Assign new SALE id
      const newSaleUuid = await generateSequentialId("Sale");

      // Update status
      const updatedSale = await tx.sale.update({
        where: { id },
        data: { status: "COMPLETE", saleUuid: newSaleUuid },
      });

      // Now deduct stock and record payments (same as before)
      for (const item of draft.items) {
        await tx.stockMovement.create({
          data: {
            movementUuid: uuidv4(),
            delta: -item.qty,
            reason: "Sale",
            refId: newSaleUuid,
            product: { connect: { id: item.productId } },
            location: { connect: { id: draft.locationId } },
            user: { connect: { id: userId } },
          },
        });

        await tx.stockLevel.update({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: draft.locationId,
            },
          },
          data: { quantity: { decrement: item.qty } },
        });
      }

      if (draft.customerId) {
        await tx.ledgerEntry.create({
          data: {
            customerId: draft.customerId,
            saleId: draft.id,
            amount: draft.total,
            type: "SALE",
            description: `Sale of ${draft.total} to customer`,
          },
        });
      }

      if (payment?.amount > 0) {
        const paymentNumber = await generateSequentialId("ReceivedPayment");
        await tx.receivedPayment.create({
          data: {
            saleId: draft.id,
            amount: payment.amount,
            method: payment.method,
            customerId: draft.customerId,
            paymentNumber,
          },
        });
      }

      return updatedSale;
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------- GET SALES --------------------
router.get("/", authMiddleware, async (req, res) => {
  const { startDate, endDate, locationId, customerId, productId } = req.query;

  try {
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (locationId) where.locationId = locationId;
    if (customerId) where.customerId = customerId;
    if (productId) where.items = { some: { productId } };

    const sales = await prisma.sale.findMany({
      where,
      include: { customer: true, items: true, payments: true },
      orderBy: { createdAt: "desc" },
    });

    // Optional: total quantity sold of productId
    let qtySold = 0;
    let salesWithQty = sales;
    if (productId) {
      salesWithQty = sales.map((s) => {
        const product_qty = s.items
          .filter((it) => it.productId === productId)
          .reduce((sum, it) => sum + it.qty, 0);
        qtySold += product_qty;
        return { ...s, product_qty };
      });
    }

    res.json(productId ? { sales: salesWithQty, qtySold } : salesWithQty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- NEXT SALES --------------------
router.get("/next-number", authMiddleware, async (req, res) => {
  try {
    const saleUuid = await generateSequentialId("Sale", 4);
    res.json({ saleUuid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
