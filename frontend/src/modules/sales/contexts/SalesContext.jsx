import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  fetchSales as apiFetchSales,
  fetchDrafts as apiFetchDrafts,
  fetchDeleted as apiFetchDeleted, // ✅ import
  createSale as apiCreateSale,
  finalizeDraft as apiFinalizeDraft,
  deleteDraft as apiDeleteDraft,
  fetchReturns as apiFetchReturns,
  createReturn as apiCreateReturn,
  formatReceipt,
} from "../salesApi.js";

const SalesContext = createContext();

export function SalesProvider({ children }) {
  const [sales, setSales] = useState([]); // finalized sales
  const [drafts, setDrafts] = useState([]); // draft sales
  const [deleted, setDeleted] = useState([]); // ✅ deleted

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const loadDrafts = useCallback(async () => {
    try {
      const result = await apiFetchDrafts();
      setDrafts(result.items || []);
    } catch (err) {
      console.error(err);
      setDrafts([]);
    }
  }, []);

  const loadDeleted = useCallback(async () => {
    try {
      const result = await apiFetchDeleted();
      setDeleted(result.items || []);
    } catch (err) {
      console.error(err);
      setDeleted([]);
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
    loadDrafts();
    loadDeleted(); // ✅ load deleted sales
    loadReturns();
  }, [loadSales, loadDrafts, loadDeleted, loadReturns]);

  const previewSale = useCallback((saleData) => {
    const virtualSale = {
      id: "preview",
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

  const closePreviewSale = useCallback(() => {
    setIsPreviewOpen(false);
    setTimeout(() => setPreviewSaleData(null), 0);
  }, []);

  const addSale = useCallback(async (saleData, receiptOptions = {}) => {
    const newSale = await apiCreateSale(saleData);
    if (newSale.status === "PENDING") {
      setDrafts((prev) => [newSale, ...prev]);
    } else {
      setSales((prev) => [newSale, ...prev]);
    }
    const receipt = formatReceipt(
      newSale,
      saleData.productsMap,
      receiptOptions
    );
    return { sale: newSale, receipt };
  }, []);

  const finalizeDraft = useCallback(
    async (id, paymentData, receiptOptions = {}) => {
      const updatedSale = await apiFinalizeDraft(id, paymentData);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      setSales((prev) => [updatedSale, ...prev]);
      const receipt = formatReceipt(updatedSale, {}, receiptOptions);
      return { sale: updatedSale, receipt };
    },
    []
  );

  const removeDraft = useCallback(async (id) => {
    await apiDeleteDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
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

  // ---------------- HELPERS ----------------
  const getSaleById = useCallback(
    (id) => {
      return (
        sales.find((s) => s.id === id) ||
        drafts.find((d) => d.id === id) ||
        deleted.find((x) => x.id === id) || // ✅ include deleted
        null
      );
    },
    [sales, drafts, deleted]
  );

  const getSaleForEdit = useCallback(
    (id) => {
      const sale =
        sales.find((s) => s.id === id) ||
        drafts.find((d) => d.id === id) ||
        deleted.find((x) => x.id === id) || // ✅ include deleted
        null;

      if (!sale) return null;

      // 🔒 Return a deep clone so InvoiceForm edits are local only
      return {
        id: sale.id,
        saleUuid: sale.saleUuid,
        customer: sale.customer ? { ...sale.customer } : null,
        items: sale.items ? sale.items.map((i) => ({ ...i })) : [],
        payment: sale.payments?.[0]
          ? { ...sale.payments[0] }
          : { amount: 0, method: null },
        total: sale.total || 0,
        status: sale.status,
      };
    },
    [sales, drafts]
  );

  const getReturnById = useCallback(
    (id) => returns.find((r) => r.id === id) || null,
    [returns]
  );

  return (
    <SalesContext.Provider
      value={{
        sales,
        drafts,
        deleted, // ✅ expose deleted
        returns,
        loading,
        reloadSales: loadSales,
        reloadDrafts: loadDrafts,
        reloadDeleted: loadDeleted, // ✅ expose reloader
        reloadReturns: loadReturns,
        addSale,
        finalizeDraft,
        removeDraft,
        addReturn,
        getSaleById,
        getSaleForEdit,
        getReturnById,
        previewSale,
        previewSaleData,
        isPreviewOpen,
        closePreviewSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  return useContext(SalesContext);
}
