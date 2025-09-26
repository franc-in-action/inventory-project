// src/contexts/CategoriesContext.jsx
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  fetchCategories as apiFetchCategories,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
} from "../categoriesApi.js";

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoriesMap = categories.reduce((map, c) => {
    map[c.id] = c.name;
    return map;
  }, {});

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetchCategories();
      setCategories(result || []);
    } catch (err) {
      console.error("[CategoriesContext] Failed to fetch categories", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ---------------- CRUD ---------------- //
  const addCategory = async (name) => {
    const newCategory = await apiCreateCategory(name);
    await loadCategories();
    return newCategory;
  };

  const updateCategoryById = async (id, name) => {
    const updated = await apiUpdateCategory(id, name);
    await loadCategories();
    return updated;
  };

  const deleteCategoryById = async (id) => {
    await apiDeleteCategory(id);
    await loadCategories();
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        categoriesMap,
        loading,
        reloadCategories: loadCategories,
        addCategory,
        updateCategoryById,
        deleteCategoryById,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoriesContext);
}
