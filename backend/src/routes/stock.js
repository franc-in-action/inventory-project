import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/stock/movements
 * Body: { movementUuid, productId, locationId, delta, reason, refId }
 */
// Ensure locationId and productId are strings
router.post(
  "/movements",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { movementUuid, productId, locationId, delta, reason, refId } =
      req.body;
    const userId = req.user.userId;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Check if movement already exists
        const existing = await tx.stockMovement.findUnique({
          where: { movementUuid },
        });
        if (existing) return existing;

        // Create stock movement with proper relations
        const movement = await tx.stockMovement.create({
          data: {
            movementUuid,
            delta,
            reason,
            refId,
            product: { connect: { id: productId } },
            location: { connect: { id: locationId } },
            user: { connect: { id: userId } }, // ← correct way to set performedBy
          },
        });

        // Upsert stock level
        await tx.stockLevel.upsert({
          where: { productId_locationId: { productId, locationId } },
          update: { quantity: { increment: delta } },
          create: { productId, locationId, quantity: delta },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            action: "STOCK_MOVEMENT",
            entity: "StockMovement",
            entityId: movement.id.toString(),
            performedBy: userId,
            metadata: { delta, reason, refId },
          },
        });

        return movement;
      });

      res.status(201).json(result);
    } catch (err) {
      console.error("[POST /stock/movements] Error:", err);
      res.status(400).json({ error: err.message });
    }
  }
);

// GET /api/stock/all
// Returns all stock levels with product and location names
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const stocks = await prisma.stockLevel.findMany({
      include: {
        product: { select: { name: true } },
        location: { select: { name: true } },
      },
    });

    const result = stocks.map((s) => ({
      productId: s.productId,
      productName: s.product?.name || "Unknown",
      locationId: s.locationId,
      locationName: s.location?.name || "Unknown",
      quantity: s.quantity,
    }));

    res.json(result);
  } catch (err) {
    console.error("[GET /stock/all] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stock/:productId/:locationId
router.get("/:productId/:locationId", authMiddleware, async (req, res) => {
  const { productId, locationId } = req.params;
  try {
    const stockLevel = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId, locationId } },
    });

    if (!stockLevel) {
      return res.json({ quantity: 0 });
    }

    res.json({ quantity: stockLevel.quantity });
  } catch (err) {
    console.error(`[GET /stock/${productId}/${locationId}] Error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stock/batch?locationId=...&productIds=...
router.get("/batch", authMiddleware, async (req, res) => {
  const { locationId, productIds } = req.query;

  if (!locationId || !productIds) {
    return res
      .status(400)
      .json({ error: "locationId and productIds are required" });
  }

  try {
    const idsArray = productIds.split(","); // CSV -> array
    const stockLevels = await prisma.stockLevel.findMany({
      where: {
        locationId,
        productId: { in: idsArray },
      },
    });

    // Convert to { productId: quantity } object
    const stockMap = idsArray.reduce((acc, id) => {
      const stock = stockLevels.find((s) => s.productId === id);
      acc[id] = stock ? stock.quantity : 0;
      return acc;
    }, {});

    res.json({ stock: stockMap });
  } catch (err) {
    console.error("[GET /stock/batch] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stock/total?productIds=...
router.get("/total", authMiddleware, async (req, res) => {
  const { productIds } = req.query;
  if (!productIds)
    return res.status(400).json({ error: "productIds required" });

  try {
    const idsArray = productIds.split(",");
    const stockLevels = await prisma.stockLevel.findMany({
      where: { productId: { in: idsArray } },
    });

    // Sum quantities per product
    const stockMap = idsArray.reduce((acc, id) => {
      const total = stockLevels
        .filter((s) => s.productId === id)
        .reduce((sum, s) => sum + s.quantity, 0);
      acc[id] = total;
      return acc;
    }, {});

    res.json({ stock: stockMap });
  } catch (err) {
    console.error("[GET /stock/total] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/stock/movements?productId=...&locationId=...
 * Returns list of stock movements for a product (and optional location)
 */
router.get("/movements", authMiddleware, async (req, res) => {
  const { productId, locationId } = req.query;

  try {
    const where = {};
    if (productId) where.productId = productId;
    if (locationId) where.locationId = locationId;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { name: true } },
        location: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = movements.map((m) => ({
      id: m.id,
      productId: m.productId,
      productName: m.product?.name || "Unknown",
      locationId: m.locationId,
      locationName: m.location?.name || "Unknown",
      delta: m.delta,
      reason: m.reason,
      refId: m.refId,
      performedBy: m.user?.name || m.performedBy,
      createdAt: m.createdAt,
    }));

    res.json({ movements: result });
  } catch (err) {
    console.error("[GET /stock/movements] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
