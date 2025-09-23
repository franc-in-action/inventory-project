// src/utils/productsUtils.js

import { apiFetch } from "./commonUtils.js";

// ---------- PRODUCT API ---------- //
export async function fetchProducts() {
  if (window.api) {
    return window.api.query("SELECT * FROM products");
  }
  return apiFetch("/products");
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
