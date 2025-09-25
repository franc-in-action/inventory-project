import { prisma } from "../prisma.js";

/**
 * Compute balances for one or more customers.
 * Accepts a single ID string or an array of IDs.
 * Returns a map: { customerId: balance }
 */
export async function computeCustomerBalances(customerIds) {
  if (!customerIds) return {};

  // Normalize to array
  const ids = Array.isArray(customerIds) ? customerIds : [customerIds];

  if (ids.length === 0) return {};

  // Aggregate ledger entries grouped by customerId and type
  const ledgerAggregates = await prisma.ledgerEntry.groupBy({
    by: ["customerId", "type"],
    _sum: { amount: true },
    where: { customerId: { in: ids } },
  });

  // Initialize balance map
  const balanceMap = {};
  for (const id of ids) balanceMap[id] = 0;

  // Compute balances
  for (const entry of ledgerAggregates) {
    const { customerId, type, _sum } = entry;
    if (!_sum.amount) continue;

    switch (type) {
      case "PAYMENT_RECEIVED":
      case "RETURN":
        balanceMap[customerId] -= _sum.amount;
        break;
      case "SALE":
      case "PURCHASE":
      case "ADJUSTMENT":
        balanceMap[customerId] += _sum.amount;
        break;
    }
  }

  return balanceMap;
}
