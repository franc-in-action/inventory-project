// src/models/issuedpayments/contexts/IssuedPaymentsContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  getIssuedPayments,
  createIssuedPayment as apiCreateIssuedPayment,
  updateIssuedPayment as apiUpdateIssuedPayment,
  getIssuedPaymentById,
  deleteIssuedPayment as apiDeleteIssuedPayment,
} from "../issuedPaymentsApi.js";

import { fetchVendorById } from "../../vendors/vendorsApi.js";

const IssuedPaymentsContext = createContext();

export function IssuedPaymentsProvider({ children }) {
  const [issuedPayments, setIssuedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Load all issued payments from backend */
  const loadIssuedPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIssuedPayments();
      setIssuedPayments(data || []);
    } catch (err) {
      console.error(
        "[IssuedPaymentsContext] Failed to fetch issued payments",
        err
      );
      setError(err);
      setIssuedPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Create a new issued payment and refresh local state */
  const createIssuedPayment = async (paymentData) => {
    const result = await apiCreateIssuedPayment(paymentData);
    // Add the new payment to local state
    setIssuedPayments((prev) => [...prev, result.issuedPayment]);

    // Optionally refresh vendor balance if vendorId is present
    if (paymentData.vendorId) {
      await fetchVendorById(paymentData.vendorId);
    }

    return result;
  };

  /** Update an existing issued payment */
  const updateIssuedPayment = async (id, paymentData) => {
    const result = await apiUpdateIssuedPayment(id, paymentData);
    setIssuedPayments((prev) =>
      prev.map((p) => (p.id === id ? result.issuedPayment : p))
    );

    if (paymentData.vendorId) {
      await fetchVendorById(paymentData.vendorId);
    }

    return result;
  };

  /** Retrieve a single issued payment by id (on-demand) */
  const getIssuedPayment = async (id) => getIssuedPaymentById(id);

  /** Delete an issued payment and update local state */
  const deleteIssuedPayment = async (id) => {
    const payment = issuedPayments.find((p) => p.id === id);
    await apiDeleteIssuedPayment(id);
    setIssuedPayments((prev) => prev.filter((p) => p.id !== id));

    if (payment?.vendorId) {
      await fetchVendorById(payment.vendorId);
    }
  };

  // Initial load
  useEffect(() => {
    loadIssuedPayments();
  }, [loadIssuedPayments]);

  return (
    <IssuedPaymentsContext.Provider
      value={{
        issuedPayments,
        loading,
        error,
        reloadIssuedPayments: loadIssuedPayments,
        createIssuedPayment,
        updateIssuedPayment,
        getIssuedPayment,
        deleteIssuedPayment,
      }}
    >
      {children}
    </IssuedPaymentsContext.Provider>
  );
}

export function useIssuedPayments() {
  return useContext(IssuedPaymentsContext);
}
