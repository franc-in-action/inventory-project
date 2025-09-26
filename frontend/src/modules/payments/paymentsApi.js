import { apiFetch } from "../../utils/commonApi.js";

// Create a new received payment
export async function createPayment(paymentData) {
  return apiFetch("/payments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  }); // returns { payment, ledgerEntry } including payment.paymentNumber
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
  return apiFetch("/payments"); // returns array of receivedPayment objects including paymentNumber
}

// Get a single payment by ID
export async function getPaymentById(id) {
  return apiFetch(`/payments/${id}`);
}

// Delete a payment
export async function deletePayment(id) {
  return apiFetch(`/payments/${id}`, { method: "DELETE" });
}

// --- New Adjustments API ---
export async function createAdjustment(adjustmentData) {
  return apiFetch("/adjustments", {
    method: "POST",
    body: JSON.stringify(adjustmentData),
  });
}

export async function getAdjustments() {
  return apiFetch("/adjustments");
}

export async function getAdjustmentById(id) {
  return apiFetch(`/adjustments/${id}`);
}

export async function deleteAdjustment(id) {
  return apiFetch(`/adjustments/${id}`, { method: "DELETE" });
}
