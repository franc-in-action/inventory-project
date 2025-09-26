// src/utils/categoriesApi.js
import { apiFetch } from "../../utils/commonApi.js";

// ---------- CATEGORY API ---------- //
export async function fetchCategories() {
  try {
    if (window.api) {
      const result = await window.api.query("SELECT * FROM categories");
      return result;
    }
    const result = await apiFetch("/categories");
    return result;
  } catch (err) {
    console.error("[categoriesApi] Error fetching categories:", err);
    throw err;
  }
}

export async function createCategory(name) {
  try {
    if (window.api) {
      const result = await window.api.run(
        "INSERT INTO categories (name) VALUES (?)",
        [name]
      );
      return result;
    }
    const result = await apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    return result;
  } catch (err) {
    console.error("[categoriesApi] Error creating category:", err);
    throw err;
  }
}

export async function updateCategory(id, name) {
  try {
    if (window.api) {
      const result = await window.api.run(
        "UPDATE categories SET name = ? WHERE id = ?",
        [name, id]
      );
      return result;
    }
    const result = await apiFetch(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
    return result;
  } catch (err) {
    console.error("[categoriesApi] Error updating category:", err);
    throw err;
  }
}

export async function deleteCategory(id) {
  try {
    if (window.api) {
      const result = await window.api.run(
        "DELETE FROM categories WHERE id = ?",
        [id]
      );
      return result;
    }
    const result = await apiFetch(`/categories/${id}`, { method: "DELETE" });
    return result;
  } catch (err) {
    console.error("[categoriesApi] Error deleting category:", err);
    throw err;
  }
}
