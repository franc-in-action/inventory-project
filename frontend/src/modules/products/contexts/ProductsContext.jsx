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
import ProductDetails from "../ProductDetails.jsx";

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [loading, setLoading] = useState(true);

  // --- NEW STATE for modal ---
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  const openProductDetails = (productId, locationId) => {
    setSelectedProductId(productId);
    setSelectedLocationId(locationId ?? null);
    setDetailModalOpen(true);
  };

  const closeProductDetails = () => {
    setDetailModalOpen(false);
    setSelectedProductId(null);
    setSelectedLocationId(null);
  };

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
    try {
      const newProduct = await apiCreateProduct(payload);
      await loadProductsAndStock();
      return newProduct;
    } catch (err) {
      console.error("Failed to create product", err);
      throw new Error(err?.message || "Failed to create product");
    }
  };

  const updateProductById = async (id, payload) => {
    try {
      const updated = await apiUpdateProduct(id, payload);
      await loadProductsAndStock();
      return updated;
    } catch (err) {
      console.error(`Failed to update product ${id}`, err);
      throw new Error(err?.message || "Failed to update product");
    }
  };

  const deleteProductById = async (id) => {
    try {
      await apiDeleteProduct(id);
      await loadProductsAndStock();
    } catch (err) {
      console.error(`Failed to delete product ${id}`, err);
      throw new Error(err?.message || "Failed to delete product");
    }
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

        // expose modal controls
        openProductDetails,
        closeProductDetails,
      }}
    >
      {children}

      {/* --- Mount the modal once, globally --- */}
      <ProductDetails
        isOpen={detailModalOpen}
        onClose={closeProductDetails}
        productId={selectedProductId}
        locationId={selectedLocationId}
      />
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
