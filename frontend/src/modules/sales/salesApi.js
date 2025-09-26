import { apiFetch } from "../../utils/commonApi.js";

/**
 * Create a new sale
 */
export async function createSale(saleData) {
  return apiFetch("/sales", { method: "POST", body: JSON.stringify(saleData) });
}

/**
 * Fetch sales
 */
export async function fetchSales(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/sales?${query}`);
  const sales = result.sales || result.items || result;
  return {
    items: sales,
    total: sales.length,
    qtySold: result.qtySold || 0,
  };
}

/**
 * Get sale by ID (UUID)
 */
export async function getSaleById(saleId) {
  return apiFetch(`/sales/${saleId}`);
}

/**
 * Delete a sale
 */
export async function deleteSale(saleId) {
  return apiFetch(`/sales/${saleId}`, { method: "DELETE" });
}

export async function fetchNextSaleNumber() {
  if (window.api) {
    // fallback for Electron if needed
    return window.api.run("SELECT NEXTVAL('sale_seq')"); // optional placeholder
  }
  const result = await apiFetch("/sales/next-number");
  return result.saleUuid;
}

// --- New Returns API ---
export async function createReturn(returnData) {
  return apiFetch("/returns", {
    method: "POST",
    body: JSON.stringify(returnData),
  });
}

export async function fetchReturns(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/returns?${query}`);
  return result.items || result.returns || [];
}

export async function getReturnById(returnId) {
  return apiFetch(`/returns/${returnId}`);
}

/**
 * Format a sale receipt in POS-style text
 * @param {Object} sale
 * @param {Object} productsMap - Map productId -> productName
 * @param {Object} options - Additional options (store info, tax, cashier)
 * @returns {string}
 */
export function formatReceipt(sale, productsMap = {}, options = {}) {
  const {
    storeName = "★ MY STORE ★",
    storeAddress = "123 Main St\nCity, State ZIP",
    storeTel = "Tel: 012-345-6789",
    storeTaxPin = "123456789",
    customerTaxPin = "987654321",
    cashier = "John Doe",
    paybill = "500000",
    taxRate = 0.05,
  } = options;

  const lines = [];
  const date = new Date(sale?.createdAt || Date.now());
  const subtotal = (sale?.items || []).reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const maxLine = 42;

  const wrapText = (text, length = 12) => {
    const result = [];
    let start = 0;
    while (start < text.length) {
      result.push(text.slice(start, start + length));
      start += length;
    }
    return result;
  };

  // Header
  lines.push(storeName.padStart((maxLine + storeName.length) / 2));
  lines.push(...storeAddress.split("\n"));
  lines.push(storeTel);
  lines.push(`Tax PIN: ${storeTaxPin}`);
  lines.push("-".repeat(maxLine));

  // Customer info
  lines.push(
    `Date: ${date.toLocaleDateString()}   Time: ${date.toLocaleTimeString()}`
  );
  lines.push(`Receipt #: ${sale?.saleUuid || sale?.id}`);
  lines.push(`Customer: ${sale?.customer?.name || "Walk-in"}`);
  lines.push(`Tax PIN: ${customerTaxPin}`);
  lines.push("-".repeat(maxLine));

  // Table header
  lines.push("Item         Qty   Price   Total");
  lines.push("-".repeat(maxLine));

  // Items
  (sale?.items || []).forEach((item) => {
    const name =
      productsMap[item.productId] || item.product?.name || item.productId;
    const wrapped = wrapText(name, 12);
    const lineTotal = (item.qty * item.price).toFixed(2);
    wrapped.forEach((line, idx) => {
      if (idx === 0) {
        const qtyStr = String(item.qty).padStart(3, " ");
        const priceStr = item.price.toFixed(2).padStart(6, " ");
        const totalStr = lineTotal.padStart(7, " ");
        lines.push(
          `${line.padEnd(12, " ")}  ${qtyStr}  ${priceStr}  ${totalStr}`
        );
      } else {
        lines.push(line);
      }
    });
    lines.push("-".repeat(maxLine));
  });

  // Totals
  lines.push(
    `Subtotal:`.padEnd(32, " ") + subtotal.toFixed(2).padStart(10, " ")
  );
  lines.push(
    `Tax (${(taxRate * 100).toFixed(0)}%):`.padEnd(32, " ") +
      tax.toFixed(2).padStart(10, " ")
  );
  lines.push(`TOTAL:`.padEnd(32, " ") + total.toFixed(2).padStart(10, " "));

  // Payment
  if (sale?.payments?.length) {
    lines.push(`Payment: ${sale.payments[0].method.toUpperCase()}`);
  }

  lines.push("-".repeat(maxLine));
  lines.push(`MPESA Paybill: ${paybill}`);
  lines.push(`Cashier: ${cashier}`);
  lines.push("-".repeat(maxLine));
  lines.push("      THANK YOU FOR SHOPPING!");
  lines.push("       Visit us again soon!");
  lines.push("-".repeat(maxLine));

  return lines.join("\n");
}
