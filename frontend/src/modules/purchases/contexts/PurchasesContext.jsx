import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import {
  fetchPurchases,
  createPurchase,
  receivePurchase,
  updatePurchase as apiUpdatePurchase,
} from "../purchaseApi.js";

const PurchasesContext = createContext();

export function PurchasesProvider({ children }) {
  // Core state
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [qtyPurchased, setQtyPurchased] = useState(0);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Load purchases with optional query parameters.
   * Automatically uses current page and pageSize if not overridden.
   */
  const loadPurchases = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const data = await fetchPurchases({
          page,
          pageSize,
          ...params,
        });

        setPurchases(data.items || []);
        setTotal(data.total || 0);
        setQtyPurchased(data.qtyPurchased || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("[PurchasesContext] Failed to fetch purchases:", err);
        setPurchases([]);
        setTotal(0);
        setQtyPurchased(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize]
  );

  // Create a new purchase and reload current page
  const addPurchase = useCallback(
    async (purchase) => {
      const created = await createPurchase(purchase);
      await loadPurchases();
      return created.purchase;
    },
    [loadPurchases]
  );

  // Update an existing purchase
  const updatePurchase = useCallback(
    async (purchaseId, payload) => {
      const updated = await apiUpdatePurchase(purchaseId, payload);
      await loadPurchases();
      return updated;
    },
    [loadPurchases]
  );

  // Mark a purchase as received
  const markReceived = useCallback(
    async (purchaseId) => {
      const updated = await receivePurchase(purchaseId);
      await loadPurchases();
      return updated;
    },
    [loadPurchases]
  );

  // Reload purchases when page or pageSize changes
  useEffect(() => {
    loadPurchases();
  }, [loadPurchases, page, pageSize]);

  return (
    <PurchasesContext.Provider
      value={{
        purchases,
        total,
        qtyPurchased,
        loading,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
        loadPurchases,
        addPurchase,
        updatePurchase,
        markReceived,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  return useContext(PurchasesContext);
}
