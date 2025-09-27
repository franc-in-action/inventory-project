import { createContext, useContext, useState, useCallback } from "react";
import { getStockValuationReport } from "../reportsApi.js";

const ReportsContext = createContext();

export function ReportsProvider({ children }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStockValuation = useCallback(async ({ period, locationId }) => {
    setLoading(true);
    try {
      const data = await getStockValuationReport({ period, locationId });
      setReport(data);
    } catch (err) {
      console.error(
        "[ReportsContext] Failed to load stock valuation report",
        err
      );
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ReportsContext.Provider
      value={{
        report,
        loading,
        loadStockValuation,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  return useContext(ReportsContext);
}
