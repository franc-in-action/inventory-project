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

const VendorsContext = createContext();

export function VendorsProvider({ children }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map vendorId → vendorName for quick lookup
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

  // Convenience methods that also refresh the list when appropriate
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

  const getVendorById = fetchVendorById; // just re-export the API call

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
      }}
    >
      {children}
    </VendorsContext.Provider>
  );
}

export function useVendors() {
  return useContext(VendorsContext);
}
