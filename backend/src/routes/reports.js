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

/** Get start-date for given period relative to now */
function periodStart(period) {
  const now = new Date();
  if (period === "daily")
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "weekly") {
    const d = new Date(now);
    const day = d.getDay(); // 0=Sun
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  // monthly
  return new Date(now.getFullYear(), now.getMonth(), 1);
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
   CUSTOMER PERFORMANCE REPORTS
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

/* -----------------------------------------------------------
   CUSTOMER PERFORMANCE REPORTS – NEW
----------------------------------------------------------- */
/**
 * GET /api/reports/customers/new
 * ?period=daily|weekly|monthly (default: monthly)
 * New customers who bought for the first time within the selected period.
 */
router.get(
  "/customers/new",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    try {
      const { period = "monthly" } = req.query;
      const start = periodStart(period);

      // Customers whose very first sale is within the selected period
      const results = await prisma.$queryRaw`
          SELECT c.id AS customer_id, c.name AS customer_name,
                 MIN(s."createdAt") AS first_sale_date
          FROM "Customer" c
          JOIN "Sale" s ON s."customerId" = c.id
          GROUP BY c.id, c.name
          HAVING MIN(s."createdAt") >= ${start}
          ORDER BY first_sale_date ASC;
        `;

      res.json({
        type: "customers-new",
        period,
        data: results.map((r) => ({
          customer_id: r.customer_id,
          customer_name: r.customer_name,
          first_sale_date: r.first_sale_date.toISOString(),
        })),
      });
    } catch (err) {
      console.error("[GET /reports/customers/new] Error:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
);

/**
 * GET /api/reports/customers/qualified
 * Qualified customers: at least one sale in the 90 days
 * prior to the start of the current month.
 */
router.get(
  "/customers/qualified",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (_req, res) => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const ninetyDaysAgo = new Date(monthStart);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const results = await prisma.$queryRaw`
          SELECT DISTINCT c.id AS customer_id, c.name AS customer_name
          FROM "Customer" c
          JOIN "Sale" s ON s."customerId" = c.id
          WHERE s."createdAt" >= ${ninetyDaysAgo}
            AND s."createdAt" <  ${monthStart}
          ORDER BY c.name;
        `;

      res.json({
        type: "customers-qualified",
        from: ninetyDaysAgo.toISOString(),
        to: monthStart.toISOString(),
        data: results.map((r) => ({
          customer_id: r.customer_id,
          customer_name: r.customer_name,
        })),
      });
    } catch (err) {
      console.error("[GET /reports/customers/qualified] Error:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
);

/**
 * GET /api/reports/customers/recalled
 * Recalled customers:
 *  - NOT in the qualified list (no sale in last 90 days before this month)
 *  - but purchased in the current month.
 */
router.get(
  "/customers/recalled",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (_req, res) => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const ninetyDaysAgo = new Date(monthStart);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const results = await prisma.$queryRaw`
          SELECT DISTINCT c.id AS customer_id, c.name AS customer_name
          FROM "Customer" c
          JOIN "Sale" s ON s."customerId" = c.id
          WHERE s."createdAt" >= ${monthStart}
            AND c.id NOT IN (
                SELECT DISTINCT s2."customerId"
                FROM "Sale" s2
                WHERE s2."createdAt" >= ${ninetyDaysAgo}
                  AND s2."createdAt" <  ${monthStart}
            )
          ORDER BY c.name;
        `;

      res.json({
        type: "customers-recalled",
        monthStart: monthStart.toISOString(),
        data: results.map((r) => ({
          customer_id: r.customer_id,
          customer_name: r.customer_name,
        })),
      });
    } catch (err) {
      console.error("[GET /reports/customers/recalled] Error:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
);

export default router;
