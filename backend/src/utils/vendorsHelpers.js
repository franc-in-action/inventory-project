// backend/src/utils/vendorsHelpers.js
import { prisma } from "../prisma.js";

/**
 * Computes vendor balances (amount owed to each vendor)
 * Uses ledger entries:
 *  - PURCHASE increases the balance (you owe the vendor)
 *  - PAYMENT_ISSUED decreases the balance
 *
 * @param {string|string[]} vendorIds - single vendorId or array of vendorIds
 * @returns {Promise<Object>} - { [vendorId]: balance }
 */
export async function computeVendorBalances(vendorIds) {
  if (!vendorIds) return {};

  // Normalize to array
  const ids = Array.isArray(vendorIds) ? vendorIds : [vendorIds];
  if (ids.length === 0) return {};

  // Aggregate ledger entries grouped by vendorId and type
  const ledgerAggregates = await prisma.ledgerEntry.groupBy({
    by: ["vendorId", "type"],
    _sum: { amount: true },
    where: { vendorId: { in: ids } },
  });

  // Initialize balance map
  const balanceMap = {};
  for (const id of ids) balanceMap[id] = 0;

  // Compute balances
  for (const entry of ledgerAggregates) {
    const { vendorId, type, _sum } = entry;
    if (!_sum.amount) continue;

    switch (type) {
      case "PURCHASE":
        balanceMap[vendorId] += _sum.amount; // you owe vendor
        break;
      case "PAYMENT_ISSUED":
        balanceMap[vendorId] -= _sum.amount; // reduces your debt
        break;
      case "ADJUSTMENT":
        balanceMap[vendorId] += _sum.amount; // optional: include adjustments
        break;
    }
  }

  return balanceMap;
}
