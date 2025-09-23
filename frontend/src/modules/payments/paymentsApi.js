// src/utils/paymentsUtils.js
import { apiFetch } from "../../utils/commonUtils.js";

export async function createPayment(paymentData) {
  return apiFetch("/payments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}
export async function getPayments() {
  return apiFetch("/payments");
}
export async function getPaymentById(id) {
  return apiFetch(`/payments/${id}`);
}
