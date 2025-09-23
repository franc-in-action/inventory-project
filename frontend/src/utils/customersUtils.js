import { apiFetch } from "./commonUtils.js";

/**
 * Create a customer
 */
export async function createCustomer(customerData) {
  return apiFetch("/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
}

/**
 * Get all customers
 */
export async function getCustomers() {
  return apiFetch("/customers");
}

/**
 * Get customer by ID
 */
export async function getCustomerById(id) {
  return apiFetch(`/customers/${id}`);
}

/**
 * Update customer
 */
export async function updateCustomer(id, customerData) {
  return apiFetch(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(customerData),
  });
}

/**
 * Delete customer
 */
export async function deleteCustomer(id) {
  return apiFetch(`/customers/${id}`, {
    method: "DELETE",
  });
}
