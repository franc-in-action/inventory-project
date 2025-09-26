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

  // Map for quick lookups
  const vendorsMap = vendors.reduce((map, v) => {
    map[v.id] = v.name;
    return map;
  }, {});

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVendors(true); // include balances
      setVendors(data || []);
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

  const getVendorById = async (id) => {
    return fetchVendorById(id, true); // include balance
  };

  const fetchProductsForVendor = async (vendorId) => {
    try {
      const products = await apiFetchVendorProducts(vendorId);
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
