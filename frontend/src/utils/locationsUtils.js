// src/utils/locationsUtils.js
import { apiFetch } from "./commonUtils.js";

export async function fetchLocations() {
  if (window.api) {
    return window.api.query("SELECT * FROM locations");
  }
  return apiFetch("/locations");
}
