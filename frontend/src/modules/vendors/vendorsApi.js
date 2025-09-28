import { apiFetch } from "../../utils/commonApi.js";

// Create a vendor
export async function createVendor(vendorData) {
  return apiFetch("/vendors", {
    method: "POST",
    body: JSON.stringify(vendorData),
  });
}

// Get vendors (paginated) with optional balances
export async function fetchVendors({
  page = 1,
  pageSize = 10,
  includeBalance = true,
} = {}) {
  return apiFetch(
    `/vendors?page=${page}&pageSize=${pageSize}${
      includeBalance ? "&includeBalance=true" : ""
    }`
  );
}

// Get vendor by ID
export async function fetchVendorById(id, includeBalance = true) {
  return apiFetch(
    `/vendors/${id}${includeBalance ? "?includeBalance=true" : ""}`
  );
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

// Get products for a vendor
export async function fetchVendorProducts(id) {
  return apiFetch(`/vendors/${id}/products`);
}
