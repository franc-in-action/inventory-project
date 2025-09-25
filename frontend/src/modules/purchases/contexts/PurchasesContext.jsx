import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  fetchPurchases,
  createPurchase,
  receivePurchase,
} from "../purchaseApi.js";

const PurchasesContext = createContext();

export function PurchasesProvider({ children }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [qtyPurchased, setQtyPurchased] = useState(0);

  // Load purchases with optional filters
  const loadPurchases = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await fetchPurchases(params);
      setPurchases(data.items || []);
      setTotal(data.total || 0);
      setQtyPurchased(data.qtyPurchased || 0);
    } catch (err) {
      console.error("[PurchasesContext] Failed to fetch purchases", err);
      setPurchases([]);
      setTotal(0);
      setQtyPurchased(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPurchase = useCallback(
    async (purchase) => {
      const created = await createPurchase(purchase);
      await loadPurchases();
      return created;
    },
    [loadPurchases]
  );

  const markReceived = useCallback(
    async (purchaseId) => {
      const updated = await receivePurchase(purchaseId);
      await loadPurchases();
      return updated;
    },
    [loadPurchases]
  );

  return (
    <PurchasesContext.Provider
      value={{
        purchases,
        total,
        qtyPurchased,
        loading,
        loadPurchases,
        addPurchase,
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
