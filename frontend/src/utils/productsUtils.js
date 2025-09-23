// src/utils/productsUtils.js

import { apiFetch } from "./commonUtils.js";

// ---------- PRODUCT API ---------- //
export async function fetchProducts(params = {}) {
  if (window.api) {
    // ----- Electron (SQLite) -----
    // Build WHERE clauses based on params
    const where = [];
    const values = [];

    if (params.search) {
      where.push("(name LIKE ? OR sku LIKE ?)");
      values.push(`%${params.search}%`, `%${params.search}%`);
    }
    if (params.categoryId) {
      where.push("categoryId = ?");
      values.push(params.categoryId);
    }
    if (params.locationId) {
      where.push("locationId = ?");
      values.push(params.locationId);
    }

    const page = parseInt(params.page || 1, 10);
    const limit = parseInt(params.limit || 10, 10);
    const offset = (page - 1) * limit;

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Query rows
    const rows = await window.api.query(
      `SELECT * FROM products ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    // Query total count for pagination
    const [{ total }] = await window.api.query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      values
    );

    return { products: rows, total };
  }

  // ----- Web (REST API) -----
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/products?${query}`);
}

export async function fetchProductById(id) {
  if (window.api) {
    const [product] = await window.api.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );
    return product;
  }
  return apiFetch(`/products/${id}`);
}

export async function createProduct(product) {
  if (window.api) {
    return window.api.run(
      "INSERT INTO products (name, sku, price, quantity, description, categoryId) VALUES (?, ?, ?, ?, ?, ?)",
      [
        product.name,
        product.sku,
        product.price,
        product.quantity,
        product.description,
        product.categoryId,
      ]
    );
  }
  return apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export async function updateProduct(id, product) {
  if (window.api) {
    return window.api.run(
      "UPDATE products SET name=?, sku=?, price=?, quantity=?, description=?, categoryId=? WHERE id=?",
      [
        product.name,
        product.sku,
        product.price,
        product.quantity,
        product.description,
        product.categoryId,
        id,
      ]
    );
  }
  return apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id) {
  if (window.api) {
    return window.api.run("DELETE FROM products WHERE id = ?", [id]);
  }
  return apiFetch(`/products/${id}`, { method: "DELETE" });
}
