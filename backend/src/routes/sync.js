// backend/routes/sync.js
import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper to ensure entityId is string
const toEntityId = (id) =>
  id !== undefined && id !== null ? String(id) : null;

// Helper to serialize server changes
const serializeChange = (change) => ({
  ...change,
  id: change.id.toString(), // serverId stays string
  entityId: change.entityId !== null ? String(change.entityId) : null,
});

// -------------------- PUSH --------------------
router.post("/push", authMiddleware, async (req, res) => {
  const { changes } = req.body;
  if (!Array.isArray(changes))
    return res.status(400).json({ error: "Array required" });

  const results = [];
  let serverSeq = 0;

  try {
    for (const change of changes) {
      const { entityType, entityUuid, payload } = change;

      // ---------------- APPEND-ONLY ENTITIES ----------------
      if (["Sale", "StockMovement", "Purchase", "Adjustment"].includes(entityType)) {
        // Avoid double-insert by checking for same UUID in serverChange
        const existing = await prisma.serverChange.findFirst({
          where: { payload: { path: ["uuid"], equals: entityUuid } },
        });
        if (existing) {
          results.push({
            clientUuid: entityUuid,
            serverId: existing.id.toString(),
          });
          serverSeq = Number(existing.id);
          continue;
        }

        // Apply change to live domain tables
        if (entityType === "Sale") {
          await prisma.sale.create({
            data: {
              id: payload.id,
              productId: payload.productId,
              quantity: payload.quantity,
              createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
            },
          });
        }

        if (entityType === "StockMovement") {
          await prisma.stockMovement.create({
            data: {
              id: payload.id,
              productId: payload.productId,
              locationId: payload.locationId,
              delta: payload.delta,
              reason: payload.reason,
              refId: payload.refId,
              createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
            },
          });
        }

        if (entityType === "Purchase") {
          await prisma.purchase.create({
            data: {
              id: payload.id,
              productId: payload.productId,
              quantity: payload.quantity,
              supplierId: payload.supplierId,
              createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
            },
          });
        }

        if (entityType === "Adjustment") {
          await prisma.ledgerEntry.create({
            data: {
              customerId: payload.customerId,
              amount: payload.amount,
              method: payload.method,
              type: "ADJUSTMENT",
              description: payload.description,
              createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
            },
          });
        }

        // Always also log in serverChange
        const newChange = await prisma.serverChange.create({
          data: {
            entityType,
            entityId: toEntityId(payload.id),
            payload,
          },
        });

        results.push({
          clientUuid: entityUuid,
          serverId: newChange.id.toString(),
        });
        serverSeq = Number(newChange.id);
        continue;
      }

      // ---------------- MUTABLE ENTITIES ----------------
      if (entityType === "Product") {
        const existingEntity = await prisma.product.findUnique({
          where: { id: payload.id },
        });

        if (existingEntity) {
          if (
            new Date(payload.updatedAt).getTime() !==
            existingEntity.updatedAt.getTime()
          ) {
            return res.status(409).json({
              error: "Conflict",
              serverSnapshot: existingEntity,
            });
          }

          const updated = await prisma.product.update({
            where: { id: payload.id },
            data: { ...payload, updatedAt: new Date() },
          });

          const newChange = await prisma.serverChange.create({
            data: {
              entityType,
              entityId: toEntityId(updated.id),
              payload: updated,
            },
          });
          results.push({
            clientUuid: entityUuid,
            serverId: newChange.id.toString(),
          });
          serverSeq = Number(newChange.id);
        } else {
          const created = await prisma.product.create({ data: payload });
          const newChange = await prisma.serverChange.create({
            data: {
              entityType,
              entityId: toEntityId(created.id),
              payload: created,
            },
          });
          results.push({
            clientUuid: entityUuid,
            serverId: newChange.id.toString(),
          });
          serverSeq = Number(newChange.id);
        }
      }
    }

    res.json({ results, serverSeq });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- PULL --------------------
router.get("/pull", authMiddleware, async (req, res) => {
  const sinceSeq = Number(req.query.since_seq || 0);
  try {
    const changes = await prisma.serverChange.findMany({
      where: { id: { gt: sinceSeq } },
      orderBy: { id: "asc" },
    });

    const serverSeq = changes.length
      ? Number(changes[changes.length - 1].id)
      : sinceSeq;

    res.json({
      changes: changes.map(serializeChange),
      serverSeq,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
