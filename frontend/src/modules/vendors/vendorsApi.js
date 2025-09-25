// src/modulees/vendors/vendorsApi.js

import { apiFetch } from "../../utils/commonApi.js";

export async function createVendor(vendorData) {
  return apiFetch("/vendors", {
    method: "POST",
    body: JSON.stringify(vendorData),
  });
}

export async function fetchVendors() {
  return apiFetch("/vendors");
}

export async function fetchVendorById(id) {
  return apiFetch(`/vendors/${id}`);
}

export async function fetchVendorProducts(id) {
  return apiFetch(`/vendors/${id}/products`);
}

export async function updateVendor(id, vendorData) {
  return apiFetch(`/vendors/${id}`, {
    method: "PUT",
    body: JSON.stringify(vendorData),
  });
}

export async function deleteVendor(id) {
  return apiFetch(`/vendors/${id}`, { method: "DELETE" });
}
