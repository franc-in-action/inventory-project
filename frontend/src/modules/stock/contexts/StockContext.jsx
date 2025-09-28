import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { fetchStocks } from "../stockApi.js";

const StockContext = createContext();

export function StockProvider({ children }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const loadStocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStocks({ page, pageSize });
      setStocks(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("[StockContext] Failed to fetch stocks", err);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  return (
    <StockContext.Provider
      value={{
        stocks,
        loading,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
        reloadStocks: loadStocks,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  return useContext(StockContext);
}
