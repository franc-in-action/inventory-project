import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../customersApi.js";

const CustomersContext = createContext();

export function CustomersProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map of id → name for quick lookups
  const customersMap = customers.reduce((map, c) => {
    map[c.id] = c.name;
    return map;
  }, {});

  const reloadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data || []);
    } catch (err) {
      console.error("[CustomersContext] Failed to fetch customers", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Expose CRUD helpers that automatically refresh the list
  const addCustomer = async (data) => {
    await createCustomer(data);
    await reloadCustomers();
  };

  const editCustomer = async (id, data) => {
    await updateCustomer(id, data);
    await reloadCustomers();
  };

  const removeCustomer = async (id) => {
    await deleteCustomer(id);
    await reloadCustomers();
  };

  const fetchCustomerById = (id) => getCustomerById(id);

  useEffect(() => {
    reloadCustomers();
  }, [reloadCustomers]);

  return (
    <CustomersContext.Provider
      value={{
        customers,
        customersMap,
        loading,
        reloadCustomers,
        addCustomer,
        editCustomer,
        removeCustomer,
        fetchCustomerById,
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  return useContext(CustomersContext);
}
