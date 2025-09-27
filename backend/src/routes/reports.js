import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/reports/stock-valuation
 * Query params:
 *   period: "daily" | "weekly" | "monthly"   (default: "daily")
 *   locationId: optional UUID for branch; if omitted -> global
 *
 * Returns:
 *   [
 *     { period: "2025-09-27", valuation: 12345.67 },
 *     { period: "2025-09-26", valuation: 11321.55 },
 *     ...
 *   ]
 *
 * Notes:
 *   • Uses the stockLevels table to get *current* quantities
 *   • Uses product.price as the unit value
 *   • Groups by createdAt/updatedAt of stockLevels (updatedAt changes whenever quantity changes)
 */
router.get(
  "/stock-valuation",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { period = "daily", locationId } = req.query;

    // Validate period
    const validPeriods = ["daily", "weekly", "monthly"];
    if (!validPeriods.includes(period)) {
      return res
        .status(400)
        .json({ error: "Invalid period. Use daily, weekly or monthly." });
    }

    try {
      /**
       * Approach:
       *   We want a time series of valuations.  We'll aggregate by date buckets.
       *   - Use Prisma’s $queryRaw so we can use DATE_TRUNC (PostgreSQL) for daily/weekly/monthly grouping.
       */
      const locationFilter = locationId ? `WHERE sl."locationId" = $1` : "";

      // Postgres DATE_TRUNC supports 'day', 'week', 'month'
      const dateTrunc =
        period === "daily" ? "day" : period === "weekly" ? "week" : "month";

      // Parameter list changes if locationId present
      const params = [];
      if (locationId) params.push(locationId);

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

      // Format to more friendly JSON
      const formatted = results.map((r) => ({
        period: r.period.toISOString().split("T")[0], // only date part
        valuation: parseFloat(r.valuation),
      }));

      res.json({
        period,
        scope: locationId ? "location" : "global",
        locationId: locationId || null,
        data: formatted,
      });
    } catch (err) {
      console.error("[GET /reports/stock-valuation] Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
