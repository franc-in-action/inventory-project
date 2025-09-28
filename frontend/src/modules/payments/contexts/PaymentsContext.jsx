import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getPayments as apiGetPayments,
  createPayment as apiCreatePayment,
  updatePayment as apiUpdatePayment,
  getPaymentById,
  deletePayment as apiDeletePayment,
  createAdjustment as apiCreateAdjustment,
  updateAdjustment as apiUpdateAdjustment,
  getAdjustments as apiGetAdjustments,
  getAdjustmentById as apiGetAdjustmentById,
  deleteAdjustment as apiDeleteAdjustment,
} from "../paymentsApi.js";
import { getCustomerById } from "../../customers/customersApi.js";

const PaymentsContext = createContext();

export function PaymentsProvider({ children }) {
  const [payments, setPayments] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Load payments with pagination
  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, pageSize });
      const res = await apiGetPayments(params.toString()); // expects { payments, total }
      setPayments(res.payments || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("[PaymentsContext] Failed to fetch payments", err);
      setError(err);
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Load adjustments
  const loadAdjustments = useCallback(async () => {
    try {
      setAdjustments((await apiGetAdjustments()) || []);
    } catch (err) {
      console.error("[PaymentsContext] Failed to fetch adjustments", err);
      setAdjustments([]);
    }
  }, []);

  useEffect(() => {
    loadPayments();
    loadAdjustments();
  }, [loadPayments, loadAdjustments]);

  // -------------------- PAYMENTS --------------------
  const createPayment = async (data) => {
    const result = await apiCreatePayment(data);
    await loadPayments();
    if (data.customerId) await getCustomerById(data.customerId);
    return result;
  };

  const updatePayment = async (id, data) => {
    const result = await apiUpdatePayment(id, data);
    await loadPayments();
    if (data.customerId) await getCustomerById(data.customerId);
    return result;
  };

  const deletePayment = async (id) => {
    const payment = payments.find((p) => p.id === id);
    await apiDeletePayment(id);
    await loadPayments();
    if (payment?.customerId) await getCustomerById(payment.customerId);
  };

  const getPayment = async (id) => getPaymentById(id);

  // -------------------- ADJUSTMENTS --------------------
  const createAdjustment = async (data) => {
    await apiCreateAdjustment(data);
    await loadAdjustments();
    if (data.customerId) await getCustomerById(data.customerId);
  };

  const updateAdjustment = async (id, data) => {
    await apiUpdateAdjustment(id, data);
    await loadAdjustments();
    if (data.customerId) await getCustomerById(data.customerId);
  };

  const deleteAdjustment = async (id) => {
    const adjustment = adjustments.find((a) => a.id === id);
    await apiDeleteAdjustment(id);
    await loadAdjustments();
    if (adjustment?.customerId) await getCustomerById(adjustment.customerId);
  };

  const getAdjustment = async (id) => apiGetAdjustmentById(id);

  return (
    <PaymentsContext.Provider
      value={{
        payments,
        adjustments,
        loading,
        error,
        page,
        setPage,
        pageSize,
        setPageSize,
        total,
        reloadPayments: loadPayments,
        reloadAdjustments: loadAdjustments,
        createPayment,
        updatePayment,
        deletePayment,
        getPayment,
        createAdjustment,
        updateAdjustment,
        deleteAdjustment,
        getAdjustment,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePayments() {
  return useContext(PaymentsContext);
}
