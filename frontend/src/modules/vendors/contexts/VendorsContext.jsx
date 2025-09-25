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
} from "../vendorsApi.js";
import { fetchProductsForVendor as apiFetchProductsForVendor } from "../../purchases/purchaseApi.js";

const VendorsContext = createContext();

export function VendorsProvider({ children }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const vendorsMap = vendors.reduce((map, v) => {
    map[v.id] = v.name;
    return map;
  }, {});

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVendors();
      setVendors(data);
    } catch (err) {
      console.error("[VendorsContext] Failed to fetch vendors", err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const getVendorById = fetchVendorById;

  // ✅ New: fetch products for a specific vendor
  const fetchProductsForVendor = async (vendorId) => {
    try {
      const products = await apiFetchProductsForVendor(vendorId);
      return products;
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
        reloadVendors: loadVendors,
        addVendor,
        editVendor,
        removeVendor,
        getVendorById,
        fetchProductsForVendor, // expose in context
      }}
    >
      {children}
    </VendorsContext.Provider>
  );
}

export function useVendors() {
  return useContext(VendorsContext);
}
