// src/modules/locations/locationsApi.js
import { apiFetch } from "../../utils/commonApi.js";

/**
 * Fetch all locations
 */
export async function fetchLocations() {
  if (window.api) {
    const rows = await window.api.query("SELECT * FROM locations");
    return Array.isArray(rows) ? rows : [];
  }
  const result = await apiFetch("/locations");
  return result || [];
}

/**
 * Fetch a single location by ID
 */
export async function fetchLocationById(id) {
  if (!id) return null;
  if (window.api) {
    const rows = await window.api.query(
      "SELECT * FROM locations WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }
  return apiFetch(`/locations/${id}`);
}

/**
 * Create a new location
 */
export async function createLocation(payload) {
  if (window.api) {
    const result = await window.api.query(
      "INSERT INTO locations (name, address) VALUES (?, ?)",
      [payload.name, payload.address]
    );
    return { id: result.lastID, ...payload };
  }
  return apiFetch("/locations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing location
 */
export async function updateLocation(id, payload) {
  if (!id) throw new Error("Location ID is required");
  if (window.api) {
    await window.api.query(
      "UPDATE locations SET name = ?, address = ? WHERE id = ?",
      [payload.name, payload.address, id]
    );
    return { id, ...payload };
  }
  return apiFetch(`/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a location
 */
export async function deleteLocation(id) {
  if (!id) throw new Error("Location ID is required");
  if (window.api) {
    await window.api.query("DELETE FROM locations WHERE id = ?", [id]);
    return true;
  }
  return apiFetch(`/locations/${id}`, { method: "DELETE" });
}
