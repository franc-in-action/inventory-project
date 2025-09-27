import { createContext, useContext, useState, useCallback } from "react";
import {
  getStockValuationReport,
  getStockMovementsReport,
  getSalesReport,
  getCustomerPerformanceReport,
} from "../reportsApi.js";

const ReportsContext = createContext();

export function ReportsProvider({ children }) {
  const [report, setReport] = useState(null);
  const [movementReport, setMovementReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [customerPerformance, setCustomerPerformance] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStockValuation = useCallback(async ({ period, locationId }) => {
    setLoading(true);
    try {
      const data = await getStockValuationReport({ period, locationId });
      setReport(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStockMovements = useCallback(async ({ period, locationId }) => {
    setLoading(true);
    try {
      const data = await getStockMovementsReport({ period, locationId });
      setMovementReport(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSalesReport = useCallback(
    async ({ period, locationId, customerId }) => {
      setLoading(true);
      try {
        const data = await getSalesReport({ period, locationId, customerId });
        setSalesReport(data);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadCustomerPerformance = useCallback(
    async ({ period, locationId, limit }) => {
      setLoading(true);
      try {
        const data = await getCustomerPerformanceReport({
          period,
          locationId,
          limit,
        });
        setCustomerPerformance(data);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <ReportsContext.Provider
      value={{
        report,
        movementReport,
        salesReport,
        customerPerformance,
        loading,
        loadStockValuation,
        loadStockMovements,
        loadSalesReport,
        loadCustomerPerformance,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  return useContext(ReportsContext);
}
