// src/utils/salesUtils.js
import { apiFetch } from "./commonUtils.js";

// ---------- SALES API ---------- //

/**
 * Create a new sale
 * @param {Object} saleData - { locationId, customerId, items, payment }
 * @returns {Promise<Object>} created sale
 */
export async function createSale(saleData) {
  if (window.api) {
    const { locationId, customerId, items, total } = saleData;

    // Example Electron insert
    return window.api.run(
      `INSERT INTO sales (saleUuid, locationId, customerId, total, createdAt)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [saleData.saleUuid, locationId, customerId, total]
    );
  }

  return apiFetch("/sales", { method: "POST", body: JSON.stringify(saleData) });
}

/**
 * Get sales (optionally filtered by date, location, customer)
 * @param {Object} params - { startDate, endDate, locationId, customerId }
 * @returns {Promise<{ items: Array, total: number }>} normalized sales list
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
      `SELECT * FROM sales ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const [{ total }] = await window.api.query(
      `SELECT COUNT(*) as total FROM sales ${whereClause}`,
      values
    );

    return { items: Array.isArray(rows) ? rows : [], total: total || 0 };
  }

  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/sales?${query}`);
  return { items: result.sales || [], total: result.total || 0 };
}

/**
 * Get a single sale by ID or UUID
 * @param {string|number} saleId
 * @returns {Promise<Object|null>}
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
 * Delete a sale (if supported)
 * @param {string|number} saleId
 * @returns {Promise<Object>}
 */
export async function deleteSale(saleId) {
  if (window.api) {
    return window.api.run("DELETE FROM sales WHERE id = ?", [saleId]);
  }
  return apiFetch(`/sales/${saleId}`, { method: "DELETE" });
}

/**
 * Format a sale receipt
 * @param {Object} sale
 * @returns {string}
 */
export function formatReceipt(sale) {
  const lines = [
    `SALE RECEIPT: ${sale.saleUuid}`,
    `Date: ${new Date(sale.createdAt).toLocaleString()}`,
    `Customer: ${sale.customer?.name || "Walk-in"}`,
    `Items:`,
  ];

  sale.items.forEach((item) => {
    lines.push(
      `${item.qty} x ${item.product?.name || item.productId} @ ${
        item.price
      } = ${item.qty * item.price}`
    );
  });

  lines.push(`Total: ${sale.total}`);
  if (sale.payments?.length) {
    sale.payments.forEach((p) =>
      lines.push(`Paid: ${p.amount} via ${p.method}`)
    );
  }

  return lines.join("\n");
}
