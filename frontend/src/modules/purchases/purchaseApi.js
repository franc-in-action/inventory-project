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

    // support productId by joining purchaseItem
    let join = "";
    if (params.productId) {
      join = "JOIN purchaseItem pi ON pi.purchaseId = p.id";
      where.push("pi.productId = ?");
      values.push(params.productId);
    }

    const page = parseInt(params.page || 1, 10);
    const limit = parseInt(params.limit || 10, 10);
    const offset = (page - 1) * limit;
    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await window.api.query(
      `SELECT p.* FROM purchases p
       ${join}
       ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const [{ total }] = await window.api.query(
      `SELECT COUNT(DISTINCT p.id) as total FROM purchases p
       ${join}
       ${whereClause}`,
      values
    );

    let items = Array.isArray(rows) ? rows : [];
    let qtyPurchased = 0;
    if (params.productId) {
      const sumRows = await window.api.query(
        `SELECT SUM(pi.qty) as qtyPurchased FROM purchaseItem pi WHERE pi.productId = ?`,
        [params.productId]
      );
      qtyPurchased = sumRows?.[0]?.qtyPurchased || 0;
      return { items, total: total || 0, qtyPurchased };
    }

    return { items, total: total || 0 };
  }

  const query = new URLSearchParams(params).toString();
  const result = await apiFetch(`/purchases?${query}`);
  if (params.productId) {
    // server returns { purchases, total, qtyPurchased }
    return {
      items: result.purchases || [],
      total: result.total || 0,
      qtyPurchased: result.qtyPurchased || 0,
    };
  }
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
