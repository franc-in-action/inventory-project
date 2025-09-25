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

/**
 * Generate a plain-text receipt matching the "generateReceiptText" format
 * @param {Object} sale - sale object with items & payments
 * @param {Object} [productsMap] - optional { productId: productName } map
 * @returns {string}
 */
export function formatReceipt(sale, productsMap = {}) {
  const lines = [];
  lines.push("==== MY STORE ====");
  lines.push(`Sale: ${sale?.saleUuid || sale?.id}`);
  lines.push(`Date: ${new Date(sale?.createdAt).toLocaleString()}`);
  lines.push(`Customer: ${sale?.customer?.name || "Walk-in"}`);
  lines.push("-----------------------------");

  let total = 0;
  (sale.items || []).forEach((item) => {
    // ✅ Prefer productsMap name if available, otherwise fallback to id
    const name =
      productsMap[item.productId] || item.product?.name || item.productId;
    const lineTotal = item.qty * item.price;
    total += lineTotal;
    lines.push(`${name} x${item.qty}`);
    lines.push(`  ${item.price.toFixed(2)}  ${lineTotal.toFixed(2)}`);
  });

  lines.push("-----------------------------");
  lines.push(`TOTAL: ${total.toFixed(2)}`);

  if (sale.payments?.length) {
    lines.push("Payments:");
    sale.payments.forEach((p) => {
      lines.push(`  ${p.amount.toFixed(2)} via ${p.method}`);
    });
  }

  lines.push("-----------------------------");
  lines.push("Thank you for your purchase!");
  lines.push("\n\n");

  return lines.join("\n");
}
