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
 * Supports params.productId to filter sales that include that product.
 * When productId is used the HTTP API returns { sales, qtySold }
 */
export async function fetchSales(params = {}) {
  if (window.api) {
    const where = [];
    const values = [];

    if (params.locationId) {
      where.push("s.locationId = ?");
      values.push(params.locationId);
    }
    if (params.customerId) {
      where.push("s.customerId = ?");
      values.push(params.customerId);
    }
    if (params.startDate) {
      where.push("s.createdAt >= ?");
      values.push(params.startDate);
    }
    if (params.endDate) {
      where.push("s.createdAt <= ?");
      values.push(params.endDate);
    }

    // If productId is provided, join with saleItem table and filter
    let join = "";
    if (params.productId) {
      join = "JOIN saleItem si ON si.saleId = s.id";
      where.push("si.productId = ?");
      values.push(params.productId);
    }

    const page = parseInt(params.page || 1, 10);
    const limit = parseInt(params.limit || 10, 10);
    const offset = (page - 1) * limit;

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await window.api.query(
      `SELECT s.*, c.name AS customer_name
       FROM sales s
       LEFT JOIN customer c ON s.customerId = c.id
       ${join}
       ${whereClause} ORDER BY s.createdAt DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    // When productId is present in Electron mode we also want qty per saleItem; attempt to fetch item details
    let itemsNormalized = rows.map((r) => ({
      ...r,
      customer: { name: r.customer_name || "—" },
      payments: [],
      items: [], // electron mode - not joining sale items details here for simplicity
    }));

    // compute total count (simple count query)
    const [{ total }] = await window.api.query(
      `SELECT COUNT(DISTINCT s.id) as total
       FROM sales s
       ${join}
       ${whereClause}`,
      values
    );

    // compute qtySold for productId (if provided)
    let qtySold = 0;
    if (params.productId) {
      const qtyRows = await window.api.query(
        `SELECT SUM(si.qty) as qtySold FROM saleItem si
         JOIN sales s ON s.id = si.saleId
         WHERE si.productId = ?`,
        [params.productId]
      );
      qtySold = qtyRows?.[0]?.qtySold || 0;
      return { items: itemsNormalized, total: total || 0, qtySold };
    }

    return { items: itemsNormalized, total: total || 0 };
  }

  // Fallback to HTTP API
  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/sales?${query}`);

  if (params.productId) {
    // server returns { sales, qtySold }
    const sales = result.sales || result;
    const qtySold = result.qtySold || 0;
    return { items: sales, total: sales.length, qtySold };
  }

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
