// src/utils/customersUtils.js
import { apiFetch } from "../../utils/commonUtils.js";

export async function createCustomer(customerData) {
  return apiFetch("/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
}
export async function getCustomers() {
  return apiFetch("/customers");
}
export async function getCustomerById(id) {
  return apiFetch(`/customers/${id}`);
}
export async function updateCustomer(id, customerData) {
  return apiFetch(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(customerData),
  });
}
export async function deleteCustomer(id) {
  return apiFetch(`/customers/${id}`, { method: "DELETE" });
}
