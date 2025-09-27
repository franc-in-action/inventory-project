import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  fetchSales as apiFetchSales,
  createSale as apiCreateSale,
  fetchReturns as apiFetchReturns,
  createReturn as apiCreateReturn,
  formatReceipt,
} from "../salesApi.js";

const SalesContext = createContext();

export function SalesProvider({ children }) {
  const [sales, setSales] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Preview sale state
  const [previewSaleData, setPreviewSaleData] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetchSales();
      setSales(result.items || []);
    } catch (err) {
      console.error(err);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReturns = useCallback(async () => {
    try {
      const result = await apiFetchReturns();
      setReturns(result || []);
    } catch (err) {
      console.error(err);
      setReturns([]);
    }
  }, []);

  useEffect(() => {
    loadSales();
    loadReturns();
  }, [loadSales, loadReturns]);

  // Open preview sale safely
  const previewSale = useCallback((saleData) => {
    const virtualSale = {
      id: "preview", // dummy ID
      saleUuid: saleData.saleUuid,
      customer: saleData.customer || null,
      items: saleData.items || [],
      payments: [saleData.payment || { amount: 0, method: "cash" }],
      total: saleData.total || 0,
      status: "preview",
    };
    setPreviewSaleData(virtualSale);
    setIsPreviewOpen(true);
    return virtualSale;
  }, []);

  const getSaleForEdit = useCallback(
    (id) => {
      const sale = sales.find((s) => s.id === id);
      if (!sale) return null;

      return {
        id: sale.id,
        saleUuid: sale.saleUuid,
        customer: sale.customer || null,
        items: sale.items || [],
        payment: sale.payments?.[0] || { amount: 0, method: "cash" },
        total: sale.total || 0,
        status: sale.status,
      };
    },
    [sales]
  );

  // Close preview safely
  const closePreviewSale = useCallback(() => {
    setIsPreviewOpen(false);
    // delay clearing data to prevent render errors
    setTimeout(() => setPreviewSaleData(null), 0);
  }, []);

  const addSale = useCallback(async (saleData, receiptOptions = {}) => {
    const newSale = await apiCreateSale(saleData);
    setSales((prev) => [newSale, ...prev]);
    const receipt = formatReceipt(
      newSale,
      saleData.productsMap,
      receiptOptions
    );
    return { sale: newSale, receipt };
  }, []);

  const addReturn = useCallback(async (returnData, receiptOptions = {}) => {
    const newReturn = await apiCreateReturn(returnData);
    setReturns((prev) => [newReturn, ...prev]);
    const receipt = formatReceipt(
      newReturn,
      returnData.productsMap,
      receiptOptions,
      true
    );
    return { return: newReturn, receipt };
  }, []);

  const getSaleById = useCallback(
    (id) => sales.find((s) => s.id === id) || null,
    [sales]
  );
  const getReturnById = useCallback(
    (id) => returns.find((r) => r.id === id) || null,
    [returns]
  );

  return (
    <SalesContext.Provider
      value={{
        sales,
        returns,
        loading,
        reloadSales: loadSales,
        reloadReturns: loadReturns,
        addSale,
        addReturn,
        getSaleById,
        getReturnById,
        previewSale,
        previewSaleData,
        isPreviewOpen,
        closePreviewSale,
        getSaleForEdit,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  return useContext(SalesContext);
}
