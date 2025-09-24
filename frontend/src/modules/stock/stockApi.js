// utils/stockApi.js

import { apiFetch } from "../../utils/commonApi.js";

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
