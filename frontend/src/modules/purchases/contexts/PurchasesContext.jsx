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
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [qtyPurchased, setQtyPurchased] = useState(0);

  // Load purchases and update state
  const loadPurchases = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await fetchPurchases(params);
      setPurchases(data.items);
      setTotal(data.total);
      setQtyPurchased(data.qtyPurchased);
    } catch (err) {
      console.error("[PurchasesContext] Failed to fetch purchases:", err);
      setPurchases([]);
      setTotal(0);
      setQtyPurchased(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new purchase and refresh list
  const addPurchase = useCallback(
    async (purchase) => {
      const created = await createPurchase(purchase);
      await loadPurchases();
      return created.purchase;
    },
    [loadPurchases]
  );

  // Update an existing purchase using the API function
  const updatePurchase = useCallback(
    async (purchaseId, payload) => {
      const updated = await apiUpdatePurchase(purchaseId, payload);
      await loadPurchases();
      return updated;
    },
    [loadPurchases]
  );

  // Mark a purchase as received and refresh list
  const markReceived = useCallback(
    async (purchaseId) => {
      const updated = await receivePurchase(purchaseId);
      await loadPurchases();
      return updated;
    },
    [loadPurchases]
  );

  // Load purchases on mount
  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  return (
    <PurchasesContext.Provider
      value={{
        purchases,
        total,
        qtyPurchased,
        loading,
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
