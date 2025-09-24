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
    // ... unchanged Electron code ...
    // (kept for brevity)
  }

  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/sales?${query}`);
  const sales = result.sales || result.items || result;
  return {
    items: sales,
    total: sales.length,
    qtySold: result.qtySold || 0,
  };
}

export async function getSaleById(saleId) {
  if (window.api) {
    const [sale] = await window.api.query("SELECT * FROM sales WHERE id = ?", [
      saleId,
    ]);
    return sale || null;
  }
  return apiFetch(`/sales/${saleId}`);
}

export async function deleteSale(saleId) {
  if (window.api) {
    return window.api.run("DELETE FROM sales WHERE id = ?", [saleId]);
  }
  return apiFetch(`/sales/${saleId}`, { method: "DELETE" });
}

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
