import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper to ensure entityId is string
const toEntityId = (id) =>
  id !== undefined && id !== null ? String(id) : null;

// Helper to convert ServerChange (and BigInt IDs) for JSON
const serializeChange = (change) => ({
  ...change,
  id: change.id.toString(),
  entityId: change.entityId !== null ? String(change.entityId) : null,
});

// -------------------- PUSH --------------------
router.post("/push", authMiddleware, async (req, res) => {
  const { changes } = req.body;
  if (!Array.isArray(changes))
    return res.status(400).json({ error: "Array required" });

  const results = [];
  let serverSeq = 0n;

  try {
    for (const change of changes) {
      const { entityType, entityUuid, payload } = change;

      // ----------------- Append-only entities -----------------
      if (["Sale", "StockMovement", "Purchase"].includes(entityType)) {
        const existing = await prisma.serverChange.findFirst({
          where: { payload: { path: ["uuid"], equals: entityUuid } },
        });
        if (existing) {
          results.push({
            clientUuid: entityUuid,
            serverId: existing.id.toString(),
          });
          continue;
        }

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
        serverSeq = newChange.id;
        continue;
      }

      // ----------------- Mutable entities -----------------
      if (["Product"].includes(entityType)) {
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

          // Apply update
          const updated = await prisma.product.update({
            where: { id: payload.id },
            data: { ...payload, updatedAt: new Date() },
          });

          // Record server change
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
          serverSeq = newChange.id;
          continue;
        } else {
          // Create new product
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
          serverSeq = newChange.id;
          continue;
        }
      }
    }

    res.json({
      results,
      serverSeq: serverSeq.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- PULL --------------------
router.get("/pull", authMiddleware, async (req, res) => {
  const sinceSeq = BigInt(req.query.since_seq || 0);
  try {
    const changes = await prisma.serverChange.findMany({
      where: { id: { gt: sinceSeq } },
      orderBy: { id: "asc" },
    });

    const serverSeq = changes.length
      ? changes[changes.length - 1].id
      : sinceSeq;

    res.json({
      changes: changes.map(serializeChange),
      serverSeq: serverSeq.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
