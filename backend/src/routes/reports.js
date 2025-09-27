import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -----------------------------------------------------------
   HELPERS
----------------------------------------------------------- */
function validatePeriod(period) {
  const valid = ["daily", "weekly", "monthly"];
  if (!valid.includes(period)) {
    const err = new Error("Invalid period. Use daily, weekly or monthly.");
    err.statusCode = 400;
    throw err;
  }
  return period === "daily" ? "day" : period === "weekly" ? "week" : "month";
}

/* -----------------------------------------------------------
   STOCK VALUATION REPORT
----------------------------------------------------------- */
/**
 * GET /api/reports/stock-valuation
 * ?period=daily|weekly|monthly
 * ?locationId=<uuid>
 */
router.get(
  "/stock-valuation",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    try {
      const { period = "daily", locationId } = req.query;
      const dateTrunc = validatePeriod(period);

      const locationFilter = locationId ? `WHERE sl."locationId" = $1` : "";
      const params = locationId ? [locationId] : [];

      const results = await prisma.$queryRawUnsafe(
        `
        SELECT
          DATE_TRUNC('${dateTrunc}', sl."updatedAt") AS period,
          SUM(sl.quantity * p.price)::float AS valuation
        FROM "StockLevel" sl
        INNER JOIN "Product" p ON p.id = sl."productId"
        ${locationFilter}
        GROUP BY 1
        ORDER BY 1 DESC
        `,
        ...params
      );

      res.json({
        type: "stock-valuation",
        period,
        scope: locationId ? "location" : "global",
        locationId: locationId || null,
        data: results.map((r) => ({
          period: r.period.toISOString().split("T")[0],
          valuation: parseFloat(r.valuation),
        })),
      });
    } catch (err) {
      console.error("[GET /reports/stock-valuation] Error:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
);

/* -----------------------------------------------------------
   STOCK MOVEMENTS REPORT
----------------------------------------------------------- */
/**
 * GET /api/reports/stock-movements
 * ?period=daily|weekly|monthly
 * ?locationId=<uuid>
 */
router.get(
  "/stock-movements",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    try {
      const { period = "daily", locationId } = req.query;
      const dateTrunc = validatePeriod(period);

      const locationFilter = locationId ? `WHERE sm."locationId" = $1` : "";
      const params = locationId ? [locationId] : [];

      const results = await prisma.$queryRawUnsafe(
        `
        SELECT
          DATE_TRUNC('${dateTrunc}', sm."createdAt") AS period,
          SUM(sm.delta)::float AS total_delta,
          COUNT(sm.id)::int AS movements_count
        FROM "StockMovement" sm
        ${locationFilter}
        GROUP BY 1
        ORDER BY 1 DESC
        `,
        ...params
      );

      res.json({
        type: "stock-movements",
        period,
        scope: locationId ? "location" : "global",
        locationId: locationId || null,
        data: results.map((r) => ({
          period: r.period.toISOString().split("T")[0],
          total_delta: parseFloat(r.total_delta),
          movements_count: parseInt(r.movements_count, 10),
        })),
      });
    } catch (err) {
      console.error("[GET /reports/stock-movements] Error:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
);

/* -----------------------------------------------------------
   SALES REPORT
----------------------------------------------------------- */
/**
 * GET /api/reports/sales
 * ?period=daily|weekly|monthly
 * ?locationId=<uuid>
 * ?customerId=<uuid>
 */
router.get(
  "/sales",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    try {
      const { period = "daily", locationId, customerId } = req.query;
      const dateTrunc = validatePeriod(period);

      const filters = [];
      const params = [];
      let idx = 1;

      if (locationId) {
        filters.push(`s."locationId" = $${idx++}`);
        params.push(locationId);
      }
      if (customerId) {
        filters.push(`s."customerId" = $${idx++}`);
        params.push(customerId);
      }

      const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

      const results = await prisma.$queryRawUnsafe(
        `
        SELECT
          DATE_TRUNC('${dateTrunc}', s."createdAt") AS period,
          COUNT(s.id)::int AS sales_count,
          SUM(s.total)::float AS total_sales
        FROM "Sale" s
        ${where}
        GROUP BY 1
        ORDER BY 1 DESC
        `,
        ...params
      );

      res.json({
        type: "sales",
        period,
        scope: locationId ? "location" : "global",
        locationId: locationId || null,
        customerId: customerId || null,
        data: results.map((r) => ({
          period: r.period.toISOString().split("T")[0],
          sales_count: parseInt(r.sales_count, 10),
          total_sales: parseFloat(r.total_sales),
        })),
      });
    } catch (err) {
      console.error("[GET /reports/sales] Error:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
);

/* -----------------------------------------------------------
   CUSTOMER PERFORMANCE REPORTS  ✅ NEW
----------------------------------------------------------- */
/**
 * GET /api/reports/customer-performance
 * ?period=daily|weekly|monthly  (default: daily)
 * ?locationId=<uuid>           optional branch filter
 * ?limit=5                     optional number of top customers
 *
 * Returns top customers by:
 *  - sales volume (total sales amount)
 *  - frequency   (number of sales)
 */
router.get(
  "/customer-performance",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    try {
      const { period = "daily", locationId, limit = 5 } = req.query;
      const dateTrunc = validatePeriod(period);

      const filters = [];
      const params = [];
      let idx = 1;

      if (locationId) {
        filters.push(`s."locationId" = $${idx++}`);
        params.push(locationId);
      }

      const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

      // --- Top by Volume ---
      const topByVolume = await prisma.$queryRawUnsafe(
        `
        SELECT
          DATE_TRUNC('${dateTrunc}', s."createdAt") AS period,
          c.id AS customer_id,
          c.name AS customer_name,
          SUM(s.total)::float AS total_sales
        FROM "Sale" s
        INNER JOIN "Customer" c ON c.id = s."customerId"
        ${where}
        GROUP BY 1, c.id, c.name
        ORDER BY total_sales DESC
        LIMIT ${parseInt(limit, 10)}
        `,
        ...params
      );

      // --- Top by Frequency ---
      const topByFrequency = await prisma.$queryRawUnsafe(
        `
        SELECT
          DATE_TRUNC('${dateTrunc}', s."createdAt") AS period,
          c.id AS customer_id,
          c.name AS customer_name,
          COUNT(s.id)::int AS sales_count
        FROM "Sale" s
        INNER JOIN "Customer" c ON c.id = s."customerId"
        ${where}
        GROUP BY 1, c.id, c.name
        ORDER BY sales_count DESC
        LIMIT ${parseInt(limit, 10)}
        `,
        ...params
      );

      res.json({
        type: "customer-performance",
        period,
        scope: locationId ? "location" : "global",
        locationId: locationId || null,
        topByVolume: topByVolume.map((r) => ({
          period: r.period.toISOString().split("T")[0],
          customer_id: r.customer_id,
          customer_name: r.customer_name,
          total_sales: parseFloat(r.total_sales),
        })),
        topByFrequency: topByFrequency.map((r) => ({
          period: r.period.toISOString().split("T")[0],
          customer_id: r.customer_id,
          customer_name: r.customer_name,
          sales_count: parseInt(r.sales_count, 10),
        })),
      });
    } catch (err) {
      console.error("[GET /reports/customer-performance] Error:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
);

export default router;
