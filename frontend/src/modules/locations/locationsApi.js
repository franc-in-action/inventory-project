// src/utils/locationsUtils.js
import { apiFetch } from "../../utils/commonUtils.js";

export async function fetchLocations() {
  if (window.api) {
    const rows = await window.api.query("SELECT * FROM locations");
    return Array.isArray(rows) ? rows : [];
  }
  const result = await apiFetch("/locations");
  return result.locations || result || [];
}
