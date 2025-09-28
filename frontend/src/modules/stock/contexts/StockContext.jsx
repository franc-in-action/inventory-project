import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { fetchStockMovements } from "../stockApi.js";

const StockContext = createContext();

export function StockProvider({ children }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadMovements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStockMovements({ page, pageSize });
      setMovements(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err) {
      console.error("[StockContext] Failed to fetch movements:", err);
      setMovements([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  return (
    <StockContext.Provider
      value={{
        movements,
        loading,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
        totalCount,
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
