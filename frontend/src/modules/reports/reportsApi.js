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
