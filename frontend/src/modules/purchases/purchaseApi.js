// src/utils/purchasesApi.js
import { apiFetch } from "../../utils/commonApi.js";

export async function fetchPurchases(params = {}) {
  if (window.api) {
    const where = [];
    const values = [];

    if (params.locationId) {
      where.push("locationId = ?");
      values.push(params.locationId);
    }
    if (params.vendorId) {
      where.push("vendorId = ?");
      values.push(params.vendorId);
    }

    const page = parseInt(params.page || 1, 10);
    const limit = parseInt(params.limit || 10, 10);
    const offset = (page - 1) * limit;
    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await window.api.query(
      `SELECT * FROM purchases ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const [{ total }] = await window.api.query(
      `SELECT COUNT(*) as total FROM purchases ${whereClause}`,
      values
    );

    return { items: Array.isArray(rows) ? rows : [], total: total || 0 };
  }

  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/purchases?${query}`);
  return { items: result.purchases || [], total: result.total || 0 };
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
