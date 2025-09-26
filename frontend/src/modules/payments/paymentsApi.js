import { apiFetch } from "../../utils/commonApi.js";

// Create a new received payment
export async function createPayment(paymentData) {
  return apiFetch("/payments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  }); // returns { payment, ledgerEntry }
}

// Update an existing payment
export async function updatePayment(id, paymentData) {
  return apiFetch(`/payments/${id}`, {
    method: "PUT",
    body: JSON.stringify(paymentData),
  }); // returns { payment, ledgerEntry }
}

// Get all payments
export async function getPayments() {
  return apiFetch("/payments"); // returns array of receivedPayment objects
}

// Get a single payment by ID
export async function getPaymentById(id) {
  return apiFetch(`/payments/${id}`);
}

// Delete a payment
export async function deletePayment(id) {
  return apiFetch(`/payments/${id}`, { method: "DELETE" });
}
