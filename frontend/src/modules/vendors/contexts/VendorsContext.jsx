import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  fetchVendors,
  fetchVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  fetchVendorProducts as apiFetchVendorProducts,
} from "../vendorsApi.js";

const VendorsContext = createContext();

export function VendorsProvider({ children }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const vendorsMap = vendors.reduce((map, v) => {
    map[v.id] = v.name;
    return map;
  }, {});

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchVendors({ page, pageSize, includeBalance: true });
      setVendors(res.data || []);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err) {
      console.error("[VendorsContext] Failed to fetch vendors", err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const addVendor = async (vendorData) => {
    await createVendor(vendorData);
    await loadVendors();
  };
  const editVendor = async (id, vendorData) => {
    await updateVendor(id, vendorData);
    await loadVendors();
  };
  const removeVendor = async (id) => {
    await deleteVendor(id);
    await loadVendors();
  };
  const getVendorById = async (id) => fetchVendorById(id, true);
  const fetchProductsForVendor = async (vendorId) => {
    try {
      return await apiFetchVendorProducts(vendorId);
    } catch (err) {
      console.error(
        `[VendorsContext] Failed to fetch products for vendor ${vendorId}`,
        err
      );
      return [];
    }
  };

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  return (
    <VendorsContext.Provider
      value={{
        vendors,
        vendorsMap,
        loading,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
        reloadVendors: loadVendors,
        addVendor,
        editVendor,
        removeVendor,
        getVendorById,
        fetchProductsForVendor,
      }}
    >
      {children}
    </VendorsContext.Provider>
  );
}

export function useVendors() {
  return useContext(VendorsContext);
}
