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
} from "../salesApi.js";

const SalesContext = createContext();

export function SalesProvider({ children }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetchSales();
      setSales(result.items || []);
    } catch (err) {
      console.error("[SalesContext] Failed to fetch sales", err);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const getSaleById = useCallback(
    (id) => sales.find((s) => s.id === id) || null,
    [sales]
  );

  const addSale = useCallback(async (saleData) => {
    const newSale = await apiCreateSale(saleData);
    setSales((prev) => [newSale, ...prev]);
    return newSale;
  }, []);

  const updateSale = useCallback((updatedSale) => {
    setSales((prev) =>
      prev.map((s) => (s.id === updatedSale.id ? updatedSale : s))
    );
  }, []);

  const deleteSale = useCallback((id) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <SalesContext.Provider
      value={{
        sales,
        loading,
        reloadSales: loadSales,
        getSaleById,
        addSale,
        updateSale,
        deleteSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  return useContext(SalesContext);
}
