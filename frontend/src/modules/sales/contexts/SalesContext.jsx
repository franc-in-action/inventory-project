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
  fetchDeleted as apiFetchDeleted,
  createSale as apiCreateSale,
  finalizeDraft as apiFinalizeDraft,
  deleteDraft as apiDeleteDraft,
  fetchReturns as apiFetchReturns,
  createReturn as apiCreateReturn,
  formatReceipt,
} from "../salesApi.js";

const SalesContext = createContext();

export function SalesProvider({ children }) {
  const [sales, setSales] = useState([]); // recent sales (last 3 months)
  const [drafts, setDrafts] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [previewSaleData, setPreviewSaleData] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const threeMonthsAgo = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString();
  };

  // ---------------- LOADERS ----------------
  const loadSales = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const recentParams = {
        ...params,
        startDate: params.startDate || threeMonthsAgo(),
      };
      const result = await apiFetchSales(recentParams);
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

  // ---------------- HISTORICAL SALES ----------------
  /**
   * Fetch historical sales using backend pagination.
   * @param {Object} params - filter params (startDate, endDate, customerId, productId, etc.)
   * @param {number} page - 1-based page number
   * @param {number} pageSize - number of records per page
   */
  const fetchHistoricalSales = useCallback(
    async (params = {}, page = 1, pageSize = 100) => {
      try {
        const result = await apiFetchSales({ ...params, page, pageSize });
        return {
          items: result.items || [],
          total: result.total || 0,
          page,
          pageSize,
          hasMore: page * pageSize < (result.total || 0),
        };
      } catch (err) {
        console.error(err);
        return { items: [], total: 0, page, pageSize, hasMore: false };
      }
    },
    []
  );

  useEffect(() => {
    loadSales();
    loadDrafts();
    loadDeleted();
    loadReturns();
  }, [loadSales, loadDrafts, loadDeleted, loadReturns]);

  // ---------------- SALE OPERATIONS ----------------
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
    (id) =>
      sales.find((s) => s.id === id) ||
      drafts.find((d) => d.id === id) ||
      deleted.find((x) => x.id === id) ||
      null,
    [sales, drafts, deleted]
  );

  const getSaleForEdit = useCallback(
    (id) => {
      const sale = getSaleById(id);
      if (!sale) return null;

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
    [getSaleById]
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
        deleted,
        returns,
        loading,
        reloadSales: loadSales,
        reloadDrafts: loadDrafts,
        reloadDeleted: loadDeleted,
        reloadReturns: loadReturns,
        fetchHistoricalSales,
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
