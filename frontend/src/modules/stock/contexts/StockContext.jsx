// contexts/StockContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { fetchStocks, fetchStockMovements } from "../stockApi.js";

const StockContext = createContext();

export function StockProvider({ children }) {
  // === Stock Levels ===
  const [stocks, setStocks] = useState([]);
  const [loadingStocks, setLoadingStocks] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadStocks = useCallback(async () => {
    setLoadingStocks(true);
    try {
      const res = await fetchStocks({ page, pageSize });
      setStocks(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err) {
      console.error("[StockContext] Failed to fetch stocks:", err);
      setStocks([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoadingStocks(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  // === Stock Movements ===
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const loadMovements = useCallback(async (params = {}) => {
    setLoadingMovements(true);
    try {
      const res = await fetchStockMovements(params);
      setMovements(res.data || []);
    } catch (err) {
      console.error("[StockContext] Failed to fetch movements:", err);
      setMovements([]);
    } finally {
      setLoadingMovements(false);
    }
  }, []);

  return (
    <StockContext.Provider
      value={{
        // stocks
        stocks,
        loadingStocks,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
        totalCount,
        reloadStocks: loadStocks,

        // movements
        movements,
        loadingMovements,
        reloadMovements: loadMovements,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  return useContext(StockContext);
}
