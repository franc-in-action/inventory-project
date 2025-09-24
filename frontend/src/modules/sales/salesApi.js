import { apiFetch } from "../../utils/commonApi.js";

/**
 * Create a new sale
 */
export async function createSale(saleData) {
  if (window.api) {
    const { locationId, customerId, items, total } = saleData;
    return window.api.run(
      `INSERT INTO sales (saleUuid, locationId, customerId, total, createdAt)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [saleData.saleUuid, locationId, customerId, total]
    );
  }

  return apiFetch("/sales", { method: "POST", body: JSON.stringify(saleData) });
}

/**
 * Fetch sales (Electron or API)
 */
export async function fetchSales(params = {}) {
  if (window.api) {
    const where = [];
    const values = [];

    if (params.locationId) {
      where.push("locationId = ?");
      values.push(params.locationId);
    }
    if (params.customerId) {
      where.push("customerId = ?");
      values.push(params.customerId);
    }
    if (params.startDate) {
      where.push("createdAt >= ?");
      values.push(params.startDate);
    }
    if (params.endDate) {
      where.push("createdAt <= ?");
      values.push(params.endDate);
    }

    const page = parseInt(params.page || 1, 10);
    const limit = parseInt(params.limit || 10, 10);
    const offset = (page - 1) * limit;

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await window.api.query(
      `SELECT s.*, c.name AS customer_name
       FROM sales s
       LEFT JOIN customer c ON s.customerId = c.id
       ${whereClause} ORDER BY s.createdAt DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    // Normalize to include payments array (empty in Electron mode for now)
    const items = rows.map((r) => ({
      ...r,
      customer: { name: r.customer_name || "—" },
      payments: [],
    }));

    const [{ total }] = await window.api.query(
      `SELECT COUNT(*) as total FROM sales ${whereClause}`,
      values
    );

    return { items, total: total || 0 };
  }

  // Fallback to HTTP API
  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/sales?${query}`);

  const items = Array.isArray(result) ? result : result.sales || [];
  const total = items.length;

  return { items, total };
}

/**
 * Get a single sale by ID
 */
export async function getSaleById(saleId) {
  if (window.api) {
    const [sale] = await window.api.query("SELECT * FROM sales WHERE id = ?", [
      saleId,
    ]);
    return sale || null;
  }
  return apiFetch(`/sales/${saleId}`);
}

/**
 * Delete a sale
 */
export async function deleteSale(saleId) {
  if (window.api) {
    return window.api.run("DELETE FROM sales WHERE id = ?", [saleId]);
  }
  return apiFetch(`/sales/${saleId}`, { method: "DELETE" });
}

/**
 * Format a sale receipt
 */
export function formatReceipt(sale) {
  const lines = [
    `SALE RECEIPT: ${sale.saleUuid}`,
    `Date: ${new Date(sale.createdAt).toLocaleString()}`,
    `Customer: ${sale.customer?.name || "Walk-in"}`,
    `Items:`,
  ];

  sale.items?.forEach((item) => {
    lines.push(
      `${item.qty} x ${item.product?.name || item.productId} @ ${
        item.price
      } = ${item.qty * item.price}`
    );
  });

  lines.push(`Total: ${sale.total}`);
  sale.payments?.forEach((p) =>
    lines.push(`Paid: ${p.amount} via ${p.method}`)
  );

  return lines.join("\n");
}
