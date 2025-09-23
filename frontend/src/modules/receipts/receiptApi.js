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
