import { apiFetch } from "../../utils/commonApi.js";

// -------------------- SALES API --------------------

/**
 * Fetch finalized sales with optional pagination
 * @param {Object} params - filter params (startDate, endDate, customerId, productId, etc.)
 * @param {number} page - 1-based page number
 * @param {number} pageSize - number of records per page
 */
export async function fetchSales(params = {}, page = 1, pageSize = 100) {
  const query = new URLSearchParams({
    ...params,
    status: "COMPLETE",
    page,
    pageSize,
  }).toString();
  const result = await apiFetch(`/sales?${query}`);
  return Array.isArray(result)
    ? { items: result, total: result.length }
    : {
        items: result.sales || result.items || [],
        total: result.sales?.length || result.items?.length || 0,
      };
}

/**
 * Fetch draft sales (PENDING) with optional pagination
 */
export async function fetchDrafts(params = {}, page = 1, pageSize = 100) {
  const query = new URLSearchParams({
    ...params,
    status: "PENDING",
    page,
    pageSize,
  }).toString();
  const result = await apiFetch(`/sales?${query}`);
  return Array.isArray(result)
    ? { items: result, total: result.length }
    : {
        items: result.sales || result.items || [],
        total: result.sales?.length || result.items?.length || 0,
      };
}

/**
 * Fetch deleted/cancelled drafts with optional pagination
 */
export async function fetchDeleted(params = {}, page = 1, pageSize = 100) {
  const query = new URLSearchParams({
    ...params,
    status: "CANCELLED",
    page,
    pageSize,
  }).toString();
  const result = await apiFetch(`/sales?${query}`);
  return Array.isArray(result)
    ? { items: result, total: result.length }
    : {
        items: result.sales || result.items || [],
        total: result.sales?.length || result.items?.length || 0,
      };
}

// -------------------- SALE OPERATIONS --------------------
export async function createSale(saleData) {
  return apiFetch("/sales", { method: "POST", body: JSON.stringify(saleData) });
}

export async function finalizeDraft(saleId, paymentData) {
  return apiFetch(`/sales/${saleId}/finalize`, {
    method: "PUT",
    body: JSON.stringify(paymentData || {}),
  });
}

export async function deleteDraft(saleId) {
  return apiFetch(`/sales/${saleId}`, { method: "DELETE" });
}

export async function getSaleById(saleId) {
  return apiFetch(`/sales/${saleId}`);
}

// -------------------- RETURNS API --------------------
export async function fetchReturns(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/returns?${query}`);
  return Array.isArray(result) ? result : [];
}

export async function createReturn(returnData) {
  return apiFetch("/returns", {
    method: "POST",
    body: JSON.stringify(returnData),
  });
}

export async function updateReturn(returnId, returnData) {
  return apiFetch(`/returns/${returnId}`, {
    method: "PUT",
    body: JSON.stringify(returnData),
  });
}

export async function deleteReturn(returnId) {
  return apiFetch(`/returns/${returnId}`, { method: "DELETE" });
}

export async function getReturnById(returnId) {
  return apiFetch(`/returns/${returnId}`);
}

// -------------------- SALE NUMBERS --------------------
export async function fetchNextSaleNumber() {
  if (window.api) {
    return window.api.run("SELECT NEXTVAL('sale_seq')");
  }
  const result = await apiFetch("/sales/next-number");
  return result.saleUuid;
}

// -------------------- RECEIPT FORMATTER --------------------
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

  const subtotal = (transaction?.items || []).reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );
  const tax = subtotal * taxRate;
  const total = isReturn ? -subtotal : subtotal + tax;

  lines.push(storeName.padStart((maxLine + storeName.length) / 2));
  lines.push(...storeAddress.split("\n"));
  lines.push(storeTel);
  lines.push(`Tax PIN: ${storeTaxPin}`);
  lines.push("-".repeat(maxLine));

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
