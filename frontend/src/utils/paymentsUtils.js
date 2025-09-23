import { apiFetch } from "./commonUtils.js";

/**
 * Create a payment
 * @param {Object} paymentData - { customerId?, saleId?, amount, method }
 */
export async function createPayment(paymentData) {
  return apiFetch("/payments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}

/**
 * Get all payments
 * @returns {Promise<Array>}
 */
export async function getPayments() {
  return apiFetch("/payments");
}

/**
 * Get payment by ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function getPaymentById(id) {
  return apiFetch(`/payments/${id}`);
}
