import { apiFetch } from "../../utils/commonApi.js";

// -------------------- SALES API --------------------

/**
 * Fetch sales from backend
 * @param {Object} params - optional query params
 * @returns {Object} { items: [], total: number }
 */
export async function fetchSales(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/sales?${query}`);
  return {
    items: result.sales || result.items || [],
    total: result.sales?.length || result.items?.length || 0,
  };
}

/** Create a new sale */
export async function createSale(saleData) {
  return apiFetch("/sales", { method: "POST", body: JSON.stringify(saleData) });
}

/** Update an existing sale */
export async function updateSale(saleId, saleData) {
  return apiFetch(`/sales/${saleId}`, {
    method: "PUT",
    body: JSON.stringify(saleData),
  });
}

/** Delete a sale */
export async function deleteSale(saleId) {
  return apiFetch(`/sales/${saleId}`, { method: "DELETE" });
}

/** Get sale by ID */
export async function getSaleById(saleId) {
  return apiFetch(`/sales/${saleId}`);
}

// -------------------- RETURNS API --------------------

/** Fetch returns */
export async function fetchReturns(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/returns?${query}`);
  // Backend returns an array directly, so just return it
  return Array.isArray(result) ? result : [];
}

/** Create a new return */
export async function createReturn(returnData) {
  return apiFetch("/returns", {
    method: "POST",
    body: JSON.stringify(returnData),
  });
}

/** Update a return */
export async function updateReturn(returnId, returnData) {
  return apiFetch(`/returns/${returnId}`, {
    method: "PUT",
    body: JSON.stringify(returnData),
  });
}

/** Delete a return */
export async function deleteReturn(returnId) {
  return apiFetch(`/returns/${returnId}`, { method: "DELETE" });
}

/** Get return by ID */
export async function getReturnById(returnId) {
  return apiFetch(`/returns/${returnId}`);
}

/** Fetch next sale number (for POS numbering) */
export async function fetchNextSaleNumber() {
  if (window.api) {
    // fallback for Electron
    return window.api.run("SELECT NEXTVAL('sale_seq')");
  }
  const result = await apiFetch("/sales/next-number");
  return result.saleUuid;
}

// -------------------- POS RECEIPT FORMATTER --------------------

/**
 * Format a sale or return receipt in POS-style text
 * @param {Object} transaction - sale or return object
 * @param {Object} productsMap - Map of productId -> product name
 * @param {Object} options - store info, cashier, tax, etc.
 * @param {boolean} isReturn - true for return receipt
 * @returns {string} formatted receipt
 */
export function formatReceipt(
  transaction,
  productsMap = {},
  options = {},
  isReturn = false
) {
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
  const maxLine = 42;
  const date = new Date(transaction?.createdAt || Date.now());

  const wrapText = (text, length = 12) => {
    const result = [];
    for (let i = 0; i < text.length; i += length)
      result.push(text.slice(i, i + length));
    return result;
  };

  // Calculate totals
  const subtotal = (transaction?.items || []).reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );
  const tax = subtotal * taxRate;
  const total = isReturn ? -subtotal : subtotal + tax;

  // -------- Header --------
  lines.push(storeName.padStart((maxLine + storeName.length) / 2));
  lines.push(...storeAddress.split("\n"));
  lines.push(storeTel);
  lines.push(`Tax PIN: ${storeTaxPin}`);
  lines.push("-".repeat(maxLine));

  // -------- Customer Info --------
  lines.push(
    `Date: ${date.toLocaleDateString()}   Time: ${date.toLocaleTimeString()}`
  );
  lines.push(
    `${isReturn ? "Return" : "Receipt"} #: ${
      transaction?.saleUuid || transaction?.id
    }`
  );
  lines.push(`Customer: ${transaction?.customer?.name || "Walk-in"}`);
  lines.push(`Tax PIN: ${customerTaxPin}`);
  lines.push("-".repeat(maxLine));

  // -------- Items --------
  lines.push("Item         Qty   Price   Total");
  lines.push("-".repeat(maxLine));

  (transaction?.items || []).forEach((item) => {
    const name =
      productsMap[item.productId] || item.product?.name || item.productId;
    const wrapped = wrapText(name, 12);
    const lineTotal = (item.qty * item.price).toFixed(2);

    wrapped.forEach((line, idx) => {
      if (idx === 0) {
        const qtyStr = (isReturn ? `-${item.qty}` : item.qty)
          .toString()
          .padStart(3, " ");
        const priceStr = item.price.toFixed(2).padStart(6, " ");
        const totalStr = (isReturn ? `-${lineTotal}` : lineTotal).padStart(
          7,
          " "
        );
        lines.push(
          `${line.padEnd(12, " ")}  ${qtyStr}  ${priceStr}  ${totalStr}`
        );
      } else {
        lines.push(line);
      }
    });
    lines.push("-".repeat(maxLine));
  });

  // -------- Totals --------
  if (isReturn) {
    lines.push(
      `Total Refunded:`.padEnd(32, " ") +
        (-subtotal).toFixed(2).padStart(10, " ")
    );
  } else {
    lines.push(
      `Subtotal:`.padEnd(32, " ") + subtotal.toFixed(2).padStart(10, " ")
    );
    lines.push(
      `Tax (${(taxRate * 100).toFixed(0)}%):`.padEnd(32, " ") +
        tax.toFixed(2).padStart(10, " ")
    );
    lines.push(`TOTAL:`.padEnd(32, " ") + total.toFixed(10).padStart(10, " "));
  }

  // -------- Payment / Refund Info --------
  if (transaction?.payments?.length) {
    const method = transaction.payments[0].method.toUpperCase();
    lines.push(`${isReturn ? "Refund" : "Payment"}: ${method}`);
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
