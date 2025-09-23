// src/utils/productsUtils.js

import { apiFetch } from "./commonUtils.js";

// ---------- CATEGORY API ---------- //
export async function fetchCategories() {
  if (window.api) {
    return window.api.query("SELECT * FROM categories");
  }
  return apiFetch("/categories");
}

export async function createCategory(name) {
  if (window.api) {
    // for Electron/SQLite if you need it
    return window.api.run("INSERT INTO categories (name) VALUES (?)", [name]);
  }
  return apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
