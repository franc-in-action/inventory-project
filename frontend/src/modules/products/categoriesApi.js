// src/utils/productsApi.js
import { apiFetch } from "../../utils/commonApi.js";

// ---------- CATEGORY API ---------- //
export async function fetchCategories() {
  try {
    if (window.api) {
      // console.log("[productsUtils] Fetching categories via Electron API...");
      const result = await window.api.query("SELECT * FROM categories");
      // console.log("[productsUtils] Fetched categories:", result);
      return result;
    }

    // console.log("[productsUtils] Fetching categories via REST API...");
    const result = await apiFetch("/categories");
    // console.log("[productsUtils] Fetched categories:", result);
    return result;
  } catch (err) {
    console.error("[productsUtils] Error fetching categories:", err);
    throw err;
  }
}

export async function createCategory(name) {
  try {
    if (window.api) {
      // console.log(
      //   `[productsUtils] Creating category "${name}" via Electron API...`
      // );
      const result = await window.api.run(
        "INSERT INTO categories (name) VALUES (?)",
        [name]
      );
      // console.log("[productsUtils] Category created (Electron):", result);
      return result;
    }

    // console.log(`[productsUtils] Creating category "${name}" via REST API...`);
    const result = await apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    // console.log("[productsUtils] Category created (REST):", result);
    return result;
  } catch (err) {
    console.error("[productsUtils] Error creating category:", err);
    throw err;
  }
}
