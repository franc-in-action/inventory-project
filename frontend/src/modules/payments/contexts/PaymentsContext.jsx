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

  const createPayment = async (paymentData) => {
    const result = await apiCreatePayment(paymentData);
    // result = { payment, ledgerEntry }
    setPayments((prev) => [...prev, result.payment]);

    // Refresh customer data (for balances etc.)
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

  const getPayment = async (id) => {
    return getPaymentById(id);
  };

  const deletePayment = async (id) => {
    const payment = payments.find((p) => p.id === id);
    await apiDeletePayment(id);
    setPayments((prev) => prev.filter((p) => p.id !== id));

    if (payment?.customerId) {
      await getCustomerById(payment.customerId);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return (
    <PaymentsContext.Provider
      value={{
        payments,
        loading,
        error,
        reloadPayments: loadPayments,
        createPayment,
        updatePayment,
        getPayment,
        deletePayment,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePayments() {
  return useContext(PaymentsContext);
}
