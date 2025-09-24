// src/contexts/ProductsContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { fetchProducts } from "../modules/products/productsApi.js";
import { fetchTotalStockForProducts } from "../utils/stockApi.js";

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({}); // productId → quantity
  const [loading, setLoading] = useState(true);

  // Map productId → productName for quick lookup
  const productsMap = products.reduce((map, p) => {
    map[p.id] = p.name;
    return map;
  }, {});

  useEffect(() => {
    const loadProductsAndStock = async () => {
      setLoading(true);
      try {
        // 1️⃣ Fetch products
        const result = await fetchProducts({ limit: 1000 });
        const prods = result.items || [];
        setProducts(prods);

        // 2️⃣ Fetch total stock for all products
        const productIds = prods.map((p) => p.id);
        const stock = await fetchTotalStockForProducts(productIds);
        setStockMap(stock); // stockMap[productId] = qty
      } catch (err) {
        console.error(
          "[ProductsContext] Failed to fetch products or stock",
          err
        );
        setProducts([]);
        setStockMap({});
      } finally {
        setLoading(false);
      }
    };

    loadProductsAndStock();
  }, []);

  return (
    <ProductsContext.Provider
      value={{ products, productsMap, stockMap, loading }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

// Custom hook for easy access
export function useProducts() {
  return useContext(ProductsContext);
}
