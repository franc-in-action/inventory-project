import { createContext, useContext, useState, useCallback } from "react";
import {
  getStockValuationReport,
  getStockMovementsReport,
  getSalesReport,
  getCustomerPerformanceReport,
  getNewCustomersReport,
  getQualifiedCustomersReport,
  getRecalledCustomersReport,
} from "../reportsApi.js";

const ReportsContext = createContext();

export function ReportsProvider({ children }) {
  // -------------------- State --------------------
  const [report, setReport] = useState(null); // Stock valuation
  const [movementReport, setMovementReport] = useState(null); // Stock movements
  const [salesReport, setSalesReport] = useState(null); // Sales summary
  const [customerPerformance, setCustomerPerformance] = useState(null); // Top customers

  // ✅ New customer performance states
  const [newCustomers, setNewCustomers] = useState([]); // New customers list
  const [qualifiedCustomers, setQualifiedCustomers] = useState([]); // Qualified list
  const [recalledCustomers, setRecalledCustomers] = useState([]); // Recalled list

  const [customerActivity, setCustomerActivity] = useState([]); // Heatmap data
  const [customerActivityByCustomer, setCustomerActivityByCustomer] = useState(
    {}
  );

  const [loading, setLoading] = useState(false);

  // -------------------- Loaders --------------------
  const loadStockValuation = useCallback(async ({ period, locationId }) => {
    setLoading(true);
    try {
      const res = await getStockValuationReport({ period, locationId });
      setReport(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStockMovements = useCallback(async ({ period, locationId }) => {
    setLoading(true);
    try {
      const res = await getStockMovementsReport({ period, locationId });
      setMovementReport(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSalesReport = useCallback(
    async ({ period, locationId, customerId }) => {
      setLoading(true);
      try {
        const res = await getSalesReport({ period, locationId, customerId });
        setSalesReport(res);
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
        const res = await getCustomerPerformanceReport({
          period,
          locationId,
          limit,
        });
        setCustomerPerformance(res);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ---------- ✅ New customer performance reports ----------
  const loadNewCustomers = useCallback(async ({ period = "monthly" } = {}) => {
    setLoading(true);
    try {
      const res = await getNewCustomersReport({ period });
      // 🔑 Extract only the array of customers
      setNewCustomers(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQualifiedCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getQualifiedCustomersReport();
      setQualifiedCustomers(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecalledCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRecalledCustomersReport();
      setRecalledCustomers(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCustomerActivityHeatmap = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      const lastYear = new Date();
      lastYear.setFullYear(today.getFullYear() - 1);

      const res = await getSalesReport({ period: "daily" }); // all customers

      // Group by customer name
      const grouped = res.data.reduce((acc, record) => {
        const customerName = record.customer_name || "Unknown"; // use name as key
        if (!acc[customerName]) acc[customerName] = [];
        acc[customerName].push({
          date: record.period,
          count: record.sales_count,
        });
        return acc;
      }, {});

      setCustomerActivityByCustomer(grouped);
    } finally {
      setLoading(false);
    }
  }, []);

  // -------------------- Context value --------------------
  return (
    <ReportsContext.Provider
      value={{
        // Existing reports
        report,
        movementReport,
        salesReport,
        customerPerformance,
        customerActivity, // 🔹 add here
        customerActivityByCustomer, // per-customer heatmap data

        // ✅ New customer reports (already arrays)
        newCustomers,
        qualifiedCustomers,
        recalledCustomers,

        // Loading state
        loading,

        // Loader functions
        loadStockValuation,
        loadStockMovements,
        loadSalesReport,
        loadCustomerPerformance,
        loadNewCustomers,
        loadQualifiedCustomers,
        loadRecalledCustomers,

        loadCustomerActivityHeatmap, // 🔹 add here
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  return useContext(ReportsContext);
}
