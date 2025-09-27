import { apiFetch } from "../../utils/commonApi.js";

// Fetch stock valuation report
// period: "daily" | "weekly" | "monthly"
// locationId: optional branch id
export async function getStockValuationReport({
  period = "daily",
  locationId,
} = {}) {
  const query = new URLSearchParams({ period });
  if (locationId) query.append("locationId", locationId);
  return apiFetch(`/reports/stock-valuation?${query.toString()}`);
}

// NEW: Stock Movements
export async function getStockMovementsReport({
  period = "daily",
  locationId,
} = {}) {
  const query = new URLSearchParams({ period });
  if (locationId) query.append("locationId", locationId);
  return apiFetch(`/reports/stock-movements?${query.toString()}`);
}

// ✅ NEW: Sales Report
export async function getSalesReport({
  period = "daily",
  locationId,
  customerId,
} = {}) {
  const query = new URLSearchParams({ period });
  if (locationId) query.append("locationId", locationId);
  if (customerId) query.append("customerId", customerId);
  return apiFetch(`/reports/sales?${query.toString()}`);
}

// ✅ NEW: Customer Performance
export async function getCustomerPerformanceReport({
  period = "daily",
  locationId,
  limit = 5,
} = {}) {
  const query = new URLSearchParams({ period, limit });
  if (locationId) query.append("locationId", locationId);
  return apiFetch(`/reports/customer-performance?${query.toString()}`);
}
