import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  fetchProducts as apiFetchProducts,
  fetchProductById as apiFetchProductById,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from "../productsApi.js";
import { fetchTotalStockForProducts } from "../../stock/stockApi.js";

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Map productId → productName for quick lookup
  const productsMap = products.reduce((map, p) => {
    map[p.id] = p.name;
    return map;
  }, {});

  const loadProductsAndStock = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetchProducts({ limit: 1000 });
      const prods = result.items || [];
      setProducts(prods);

      const productIds = prods.map((p) => p.id);
      const stock = await fetchTotalStockForProducts(productIds);
      setStockMap(stock);
    } catch (err) {
      console.error("[ProductsContext] Failed to fetch products or stock", err);
      setProducts([]);
      setStockMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductsAndStock();
  }, [loadProductsAndStock]);

  // ---------------- CRUD ---------------- //
  const getProductById = async (id) => {
    const product = products.find((p) => p.id === id);
    if (product) return product; // cached
    return apiFetchProductById(id);
  };

  const addProduct = async (payload) => {
    const newProduct = await apiCreateProduct(payload);
    await loadProductsAndStock();
    return newProduct;
  };

  const updateProductById = async (id, payload) => {
    const updated = await apiUpdateProduct(id, payload);
    await loadProductsAndStock();
    return updated;
  };

  const deleteProductById = async (id) => {
    await apiDeleteProduct(id);
    await loadProductsAndStock();
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        productsMap,
        stockMap,
        loading,
        reloadProducts: loadProductsAndStock,
        getProductById,
        addProduct,
        updateProductById,
        deleteProductById,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
