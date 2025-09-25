import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { fetchProducts } from "../productsApi.js";
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
      const result = await fetchProducts({ limit: 1000 });
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

  return (
    <ProductsContext.Provider
      value={{
        products,
        productsMap,
        stockMap,
        loading,
        reloadProducts: loadProductsAndStock,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
