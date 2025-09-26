import { apiFetch } from "../../utils/commonApi.js";

// Create a new vendor
export async function createVendor(vendorData) {
  return apiFetch("/vendors", {
    method: "POST",
    body: JSON.stringify(vendorData),
  });
}

// Get all vendors with optional ledger balances
export async function fetchVendors(includeBalance = true) {
  return apiFetch(`/vendors${includeBalance ? "?includeBalance=true" : ""}`);
}

// Get single vendor by ID with optional ledger balance
export async function fetchVendorById(id, includeBalance = true) {
  return apiFetch(
    `/vendors/${id}${includeBalance ? "?includeBalance=true" : ""}`
  );
}

// Get products supplied by a vendor
export async function fetchVendorProducts(id) {
  return apiFetch(`/vendors/${id}/products`);
}

// Update vendor
export async function updateVendor(id, vendorData) {
  return apiFetch(`/vendors/${id}`, {
    method: "PUT",
    body: JSON.stringify(vendorData),
  });
}

// Delete vendor
export async function deleteVendor(id) {
  return apiFetch(`/vendors/${id}`, { method: "DELETE" });
}
