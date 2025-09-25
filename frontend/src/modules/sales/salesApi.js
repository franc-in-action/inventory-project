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
 * Format a sale receipt in POS-style text
 * @param {Object} sale
 * @param {Object} productsMap - Map productId -> productName
 * @param {Object} options - Additional options (store info, tax, cashier)
 * @returns {string}
 */
export function formatReceipt(sale, productsMap = {}, options = {}) {
  const {
    storeName = "★ STORE ★",
    storeAddress = "123 Main St\nCity, State ZIP",
    storeTel = "Tel: 012-345-6789",
    taxPin = "123456789",
    cashier = "John Doe",
    paybill = "500000",
    taxRate = 0.05,
  } = options;

  const lines = [];
  const lineWidth = 42;
  const itemCol = 12; // chars for item name
  const qtyCol = 4; // chars for quantity
  const priceCol = 10; // chars for price
  const totalCol = 12; // chars for total
  const divider = "-".repeat(lineWidth);

  // Header
  lines.push(
    storeName.padStart(Math.floor((lineWidth + storeName.length) / 2))
  );
  storeAddress
    .split("\n")
    .forEach((line) =>
      lines.push(line.padStart(Math.floor((lineWidth + line.length) / 2)))
    );
  lines.push(storeTel.padStart(Math.floor((lineWidth + storeTel.length) / 2)));
  lines.push(divider);

  const date = new Date(sale.createdAt || Date.now());
  lines.push(
    `Date: ${date.toLocaleDateString()}   Time: ${date.toLocaleTimeString()}`
  );
  lines.push(`Receipt #: ${sale.saleUuid || sale.id || "N/A"}`);
  lines.push(`Customer: ${sale.customer?.name || "Walk-in"}`);
  lines.push(`Tax PIN: ${taxPin}`);
  lines.push(divider);

  // Column headers
  lines.push(
    "Item".padEnd(itemCol) +
      "Qty".padStart(qtyCol) +
      "Price".padStart(priceCol) +
      "Total".padStart(totalCol)
  );
  lines.push(divider);

  let subtotal = 0;

  (sale.items || []).forEach((item) => {
    const fullName =
      productsMap[item.productId] || item.product?.name || item.productId || "";
    const qty = item.qty;
    const price = item.price.toFixed(2);
    const total = (item.qty * item.price).toFixed(2);
    subtotal += parseFloat(total);

    // Split item name into multiple lines if too long
    const nameLines = [];
    for (let i = 0; i < fullName.length; i += itemCol) {
      nameLines.push(fullName.slice(i, i + itemCol));
    }

    nameLines.forEach((line, idx) => {
      if (idx === 0) {
        lines.push(
          line.padEnd(itemCol) +
            String(qty).padStart(qtyCol) +
            String(price).padStart(priceCol) +
            String(total).padStart(totalCol)
        );
      } else {
        lines.push(line.padEnd(itemCol));
      }
    });

    lines.push(divider); // divider between items
  });

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  lines.push(
    "Subtotal:".padEnd(itemCol + qtyCol + priceCol) +
      subtotal.toFixed(2).padStart(totalCol)
  );
  lines.push(
    `Tax (${(taxRate * 100).toFixed(0)}%):`.padEnd(
      itemCol + qtyCol + priceCol
    ) + tax.toFixed(2).padStart(totalCol)
  );
  lines.push(
    "TOTAL:".padEnd(itemCol + qtyCol + priceCol) +
      total.toFixed(2).padStart(totalCol)
  );

  if (sale.payments?.length > 0) {
    lines.push(`Payment: ${sale.payments[0].method.toUpperCase()}`);
  }

  lines.push(divider);
  lines.push(`MPESA Paybill: ${paybill}`);
  lines.push(`Cashier: ${cashier}`);
  lines.push(divider);
  lines.push("      THANK YOU FOR SHOPPING!");
  lines.push("       Visit us again soon!");
  lines.push(divider);

  return lines.join("\n");
}
