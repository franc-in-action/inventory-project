import { apiFetch } from "../../utils/commonApi.js";

/**
 * Fetch paginated purchases from the backend
 * @param {Object} params - Optional query parameters
 *   page, pageSize, startDate, endDate, vendorId, locationId, productId
 * @returns {Promise<{ items: Array, total: number, qtyPurchased: number, page: number, pageSize: number, totalPages: number }>}
 */
export async function fetchPurchases(params = {}) {
  if (window.api) {
    // Electron-specific code (unchanged)
    return window.api.run(`SELECT * FROM purchases LIMIT ? OFFSET ?`, [
      params.pageSize || 10,
      ((params.page || 1) - 1) * (params.pageSize || 10),
    ]);
  }

  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`/purchases?${query}`);

  const items = res.data || [];
  const total = res.meta?.total || items.length;
  const qtyPurchased = items.reduce(
    (sum, p) => sum + p.items.reduce((inner, i) => inner + i.qty, 0),
    0
  );

  return {
    items,
    total,
    qtyPurchased,
    page: res.meta?.page || 1,
    pageSize: res.meta?.pageSize || items.length,
    totalPages: res.meta?.totalPages || 1,
  };
}

/**
 * Create a new purchase
 */
export async function createPurchase(purchase) {
  if (window.api) {
    return window.api.run(
      `INSERT INTO purchases (purchaseUuid, vendorId, locationId, total) VALUES (?, ?, ?, ?)`,
      [
        purchase.purchaseUuid,
        purchase.vendorId,
        purchase.locationId,
        purchase.total,
      ]
    );
  }

  return apiFetch("/purchases", {
    method: "POST",
    body: JSON.stringify(purchase),
  });
}

/**
 * Update an existing purchase
 */
export async function updatePurchase(purchaseId, payload) {
  if (window.api) {
    return window.api.run(
      `UPDATE purchases SET vendorId=?, locationId=? WHERE id=?`,
      [payload.vendorId, payload.locationId, purchaseId]
    );
  }

  return apiFetch(`/purchases/${purchaseId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Mark a purchase as received
 */
export async function receivePurchase(purchaseId) {
  if (window.api) {
    return window.api.run(`UPDATE purchases SET received = 1 WHERE id = ?`, [
      purchaseId,
    ]);
  }

  return apiFetch(`/purchases/${purchaseId}/receive`, { method: "PUT" });
}

/**
 * Fetch all vendors
 */
export async function fetchVendors() {
  return apiFetch("/vendors");
}

/**
 * Fetch all products for a given vendor
 * @param {string} vendorId
 */
export async function fetchProductsForVendor(vendorId) {
  return apiFetch(`/vendors/${vendorId}/products`);
}
