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

  const [previewSaleData, setPreviewSaleData] = useState(null);

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

  const previewSale = useCallback((saleData) => {
    // Build enriched sale object, like a real sale
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
    return virtualSale;
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
        previewSaleData, // expose preview sale
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  return useContext(SalesContext);
}
