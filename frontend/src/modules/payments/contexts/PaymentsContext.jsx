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
} from "../paymentsApi.js";

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
      setPayments(data);
    } catch (err) {
      console.error("[PaymentsContext] Failed to fetch payments", err);
      setError(err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = async (paymentData) => {
    try {
      const newPayment = await apiCreatePayment(paymentData);
      setPayments((prev) => [...prev, newPayment]);
      return newPayment;
    } catch (err) {
      console.error("[PaymentsContext] Failed to create payment", err);
      throw err;
    }
  };

  const updatePayment = async (id, paymentData) => {
    try {
      const updated = await apiUpdatePayment(id, paymentData);
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      console.error("[PaymentsContext] Failed to update payment", err);
      throw err;
    }
  };

  const getPayment = async (id) => {
    try {
      return await getPaymentById(id);
    } catch (err) {
      console.error("[PaymentsContext] Failed to fetch payment by ID", err);
      throw err;
    }
  };

  const deletePayment = async (id) => {
    try {
      await fetch(`/payments/${id}`, { method: "DELETE" });
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("[PaymentsContext] Failed to delete payment", err);
      throw err;
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
        updatePayment, // <-- add this
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
