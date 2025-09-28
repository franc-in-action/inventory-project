import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "../customersApi.js";

const CustomersContext = createContext();

export function CustomersProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const reloadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers({ page, pageSize });
      setCustomers(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("[CustomersContext] Failed to fetch customers", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

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

  const fetchCustomerById = async (id) => getCustomerById(id);

  useEffect(() => {
    reloadCustomers();
  }, [reloadCustomers]);

  return (
    <CustomersContext.Provider
      value={{
        customers,
        loading,
        reloadCustomers,
        addCustomer,
        editCustomer,
        removeCustomer,
        fetchCustomerById,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  return useContext(CustomersContext);
}
