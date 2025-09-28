import { apiFetch } from "../../utils/commonApi.js";

export async function fetchStocks({ page = 1, pageSize = 10 } = {}) {
  return apiFetch(`/stock/all?page=${page}&pageSize=${pageSize}`);
}

/**
 * Get current stock quantity for a product at a specific location
 * @param {string} productId
 * @param {string} locationId
 * @returns {Promise<number>} quantity available
 */
export async function fetchStockQuantity(productId, locationId) {
  if (!productId || !locationId) return 0;
  try {
    const res = await apiFetch(`/stock/${productId}/${locationId}`);
    return res.quantity || 0;
  } catch (err) {
    console.error("[stockApi] fetchStockQuantity error:", err);
    return 0;
  }
}

/**
 * Get current stock for multiple products at a specific location
 * @param {string[]} productIds
 * @param {string} locationId
 * @returns {Promise<Object>} { [productId]: quantity }
 */
export async function fetchStockForProducts(productIds = [], locationId) {
  if (!productIds.length || !locationId) return {};
  try {
    const res = await apiFetch(
      `/stock/batch?locationId=${locationId}&productIds=${productIds.join(",")}`
    );
    // Expected response: { productId1: qty1, productId2: qty2, ... }
    return res.stock || {};
  } catch (err) {
    console.error("[stockApi] fetchStockForProducts error:", err);
    return {};
  }
}

/**
 * Get total stock for multiple products across all locations
 * @param {string[]} productIds
 * @returns {Promise<Object>} { [productId]: totalQuantity }
 */
export async function fetchTotalStockForProducts(productIds = []) {
  if (!productIds.length) return {};
  try {
    const res = await apiFetch(
      `/stock/total?productIds=${productIds.join(",")}`
    );
    // Expected response: { productId1: totalQty1, productId2: totalQty2, ... }
    return res.stock || {};
  } catch (err) {
    console.error("[stockApi] fetchTotalStockForProducts error:", err);
    return {};
  }
}

/**
 * Fetch stock movements for a product (and optional location)
 * @param {string} productId
 * @param {string} [locationId]
 * @returns {Promise<Object[]>} movements
 */
export async function fetchStockMovements({
  productId,
  locationId,
  page = 1,
  pageSize = 10,
} = {}) {
  try {
    const q = new URLSearchParams({
      ...(productId ? { productId } : {}),
      ...(locationId ? { locationId } : {}),
      page,
      pageSize,
    }).toString();

    const res = await apiFetch(`/stock/movements?${q}`);
    return res; // now returns { data, meta }
  } catch (err) {
    console.error("[stockApi] fetchStockMovements error:", err);
    return { data: [], meta: { total: 0, page: 1, pageSize, totalPages: 1 } };
  }
}
