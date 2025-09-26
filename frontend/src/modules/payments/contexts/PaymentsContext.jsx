import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getPayments,
  createPayment as apiCreatePayment,
  updatePayment as apiUpdatePayment,
  getPaymentById,
  deletePayment as apiDeletePayment,
  createAdjustment as apiCreateAdjustment,
  getAdjustments as apiGetAdjustments,
  getAdjustmentById as apiGetAdjustmentById,
  deleteAdjustment as apiDeleteAdjustment,
} from "../paymentsApi.js";
import { getCustomerById } from "../../customers/customersApi.js";

const PaymentsContext = createContext();

export function PaymentsProvider({ children }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPayments();
      setPayments(data || []);
    } catch (err) {
      console.error("[PaymentsContext] Failed to fetch payments", err);
      setError(err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Load adjustments ---
  const loadAdjustments = useCallback(async () => {
    try {
      const data = await apiGetAdjustments();
      setAdjustments(data || []);
    } catch (err) {
      console.error("[PaymentsContext] Failed to fetch adjustments", err);
      setAdjustments([]);
    }
  }, []);

  useEffect(() => {
    loadPayments();
    loadAdjustments();
  }, [loadPayments, loadAdjustments]);

  const createPayment = async (paymentData) => {
    const result = await apiCreatePayment(paymentData);
    setPayments((prev) => [...prev, result.payment]); // payment.paymentNumber is included

    if (paymentData.customerId) {
      await getCustomerById(paymentData.customerId);
    }

    return result;
  };

  const updatePayment = async (id, paymentData) => {
    const result = await apiUpdatePayment(id, paymentData);
    setPayments((prev) => prev.map((p) => (p.id === id ? result.payment : p)));

    if (paymentData.customerId) {
      await getCustomerById(paymentData.customerId);
    }

    return result;
  };

  const getPayment = async (id) => getPaymentById(id);

  const deletePayment = async (id) => {
    const payment = payments.find((p) => p.id === id);
    await apiDeletePayment(id);
    setPayments((prev) => prev.filter((p) => p.id !== id));

    if (payment?.customerId) {
      await getCustomerById(payment.customerId);
    }
  };

  // --- Adjustments ---
  const createAdjustment = async (adjustmentData) => {
    const result = await apiCreateAdjustment(adjustmentData);
    setAdjustments((prev) => [...prev, result]);
    if (adjustmentData.customerId)
      await getCustomerById(adjustmentData.customerId);
    return result;
  };

  const getAdjustment = async (id) => apiGetAdjustmentById(id);

  const deleteAdjustment = async (id) => {
    const adjustment = adjustments.find((a) => a.id === id);
    await apiDeleteAdjustment(id);
    setAdjustments((prev) => prev.filter((a) => a.id !== id));
    if (adjustment?.customerId) await getCustomerById(adjustment.customerId);
  };

  return (
    <PaymentsContext.Provider
      value={{
        payments,
        adjustments,
        loading,
        error,
        reloadPayments: loadPayments,
        reloadAdjustments: loadAdjustments,
        createPayment,
        updatePayment,
        getPayment,
        deletePayment,
        createAdjustment,
        getAdjustment,
        deleteAdjustment,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePayments() {
  return useContext(PaymentsContext);
}
