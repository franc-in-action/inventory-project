// src/utils/salesUtils.js
import { apiFetch } from "./commonUtils.js";

/**
 * Create a new sale
 * @param {Object} saleData - { locationId, customerId, items, payment }
 * @returns {Promise<Object>} created sale
 */
export async function createSale(saleData) {
  return apiFetch("/sales", {
    method: "POST",
    body: JSON.stringify(saleData),
  });
}

/**
 * Get sales (optionally filtered by date, location, customer)
 * @param {Object} params - { startDate, endDate, locationId, customerId }
 * @returns {Promise<Array>} sales list
 */
export async function fetchSales(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/sales?${query}`);
}

/**
 * Get a single sale by ID or UUID
 * @param {string|number} saleId
 * @returns {Promise<Object>}
 */
export async function getSaleById(saleId) {
  return apiFetch(`/sales/${saleId}`);
}

/**
 * Optional: delete a sale (if your backend supports)
 * @param {string|number} saleId
 * @returns {Promise<Object>}
 */
export async function deleteSale(saleId) {
  return apiFetch(`/sales/${saleId}`, { method: "DELETE" });
}
