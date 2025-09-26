// src/utils/customersApi.js
import { apiFetch } from "../../utils/commonApi.js";

// Create a new customer
export async function createCustomer(customerData) {
  return apiFetch("/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
}

// Get all customers, include ledger balance
export async function getCustomers() {
  return apiFetch("/customers?includeBalance=true");
}

// Get single customer by ID, include ledger balance
export async function getCustomerById(id) {
  return apiFetch(`/customers/${id}?includeBalance=true`);
}

// Update customer details
export async function updateCustomer(id, customerData) {
  return apiFetch(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(customerData),
  });
}

// Delete customer
export async function deleteCustomer(id) {
  return apiFetch(`/customers/${id}`, { method: "DELETE" });
}
