import { apiFetch } from "../../utils/commonApi.js";

export async function fetchPurchases(params = {}) {
  if (window.api) {
    // ... unchanged Electron code ...
  }

  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/purchases?${query}`);
  return {
    items: result.purchases || [],
    total: result.total || 0,
    qtyPurchased: result.qtyPurchased || 0,
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

export async function receivePurchase(purchaseId) {
  if (window.api)
    return window.api.run(`UPDATE purchases SET received = 1 WHERE id = ?`, [
      purchaseId,
    ]);
  return apiFetch(`/purchases/${purchaseId}/receive`, { method: "PUT" });
}
