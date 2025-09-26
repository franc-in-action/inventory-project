// src/models/issuedpayments/issuedPaymentsApi.js
import { apiFetch } from "../../utils/commonApi.js";

// Create a new issued payment
export async function createIssuedPayment(paymentData) {
  return apiFetch("/issuedPayments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  }); // returns { issuedPayment, ledgerEntry }
}

// Update an existing issued payment
export async function updateIssuedPayment(id, paymentData) {
  return apiFetch(`/issuedPayments/${id}`, {
    method: "PUT",
    body: JSON.stringify(paymentData),
  }); // returns { issuedPayment, ledgerEntry }
}

// Get all issued payments
export async function getIssuedPayments() {
  return apiFetch("/issuedPayments"); // returns array of issuedPayment objects
}

// Get a single issued payment by ID
export async function getIssuedPaymentById(id) {
  return apiFetch(`/issuedPayments/${id}`);
}

// Delete an issued payment
export async function deleteIssuedPayment(id) {
  return apiFetch(`/issuedPayments/${id}`, { method: "DELETE" });
}
