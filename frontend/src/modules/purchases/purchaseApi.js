import { apiFetch } from "../../utils/commonApi.js";

export async function fetchPurchases(params = {}) {
  if (window.api) {
    // ... electron code unchanged ...
  }

  const query = new URLSearchParams(params).toString();
  const purchases = await apiFetch(`/purchases?${query}`);

  // The API returns an array, so just wrap it in our expected format
  return {
    items: purchases, // ✅ use the array directly
    total: purchases.length,
    qtyPurchased: purchases.reduce(
      (sum, p) => sum + p.items.reduce((inner, i) => inner + i.qty, 0),
      0
    ),
  };
}

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

// Update an existing purchase
export async function updatePurchase(purchaseId, payload) {
  if (window.api) {
    // Optional: handle Electron case if needed
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

export async function receivePurchase(purchaseId) {
  if (window.api)
    return window.api.run(`UPDATE purchases SET received = 1 WHERE id = ?`, [
      purchaseId,
    ]);
  return apiFetch(`/purchases/${purchaseId}/receive`, { method: "PUT" });
}

// FIXME: Remove this redundant
export async function fetchVendors() {
  return apiFetch("/vendors"); // new backend endpoint
}

export async function fetchProductsForVendor(vendorId) {
  return apiFetch(`/vendors/${vendorId}/products`);
}
