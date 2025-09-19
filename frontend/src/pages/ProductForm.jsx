import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  Spinner,
  Select,
  Textarea,
} from "@chakra-ui/react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function ProductForm({ productId, onSaved }) {
  const [product, setProduct] = useState({
    name: "",
    sku: "",
    price: 0,
    quantity: 0,
    description: "",
    categoryId: "",
    locationId: "", // auto-assigned by backend
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        if (window.api) {
          // offline
          const localCats = await window.api.query("SELECT * FROM categories");
          setCategories(localCats);
        } else {
          const res = await fetch(`${backendUrl}/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, [token]);

  // Fetch product if editing
  useEffect(() => {
    if (!productId) return;
    async function loadProduct() {
      try {
        if (window.api) {
          const [localProduct] = await window.api.query(
            "SELECT * FROM products WHERE id = ?",
            [productId]
          );
          if (localProduct) setProduct(localProduct);
        } else {
          const res = await fetch(`${backendUrl}/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Product not found");
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const method = productId ? "PUT" : "POST";
    const url = productId
      ? `${backendUrl}/products/${productId}`
      : `${backendUrl}/products`;

    try {
      if (window.api) {
        // offline insert/update
        if (productId) {
          await window.api.run(
            "UPDATE products SET name=?, sku=?, price=?, quantity=?, description=?, categoryId=? WHERE id=?",
            [
              product.name,
              product.sku,
              product.price,
              product.quantity,
              product.description,
              product.categoryId,
              productId,
            ]
          );
        } else {
          await window.api.run(
            "INSERT INTO products (name, sku, price, quantity, description, categoryId) VALUES (?, ?, ?, ?, ?, ?)",
            [
              product.name,
              product.sku,
              product.price,
              product.quantity,
              product.description,
              product.categoryId,
            ]
          );
        }
      } else {
        // online save
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(product),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error?.error || "Failed to save product");
        }
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <Box p={6} maxW="md">
      <Heading mb={4}>{productId ? "Edit Product" : "Create Product"}</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={3}>
          <Input
            placeholder="Name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
          <Input
            placeholder="SKU"
            name="sku"
            value={product.sku}
            onChange={handleChange}
            required
          />
          <Input
            placeholder="Price"
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
            required
          />
          <Input
            placeholder="Quantity"
            name="quantity"
            type="number"
            value={product.quantity}
            onChange={handleChange}
            required
          />
          <Textarea
            placeholder="Description"
            name="description"
            value={product.description || ""}
            onChange={handleChange}
          />
          <Select
            placeholder="Select category"
            name="categoryId"
            value={product.categoryId || ""}
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>

          <Button type="submit" isLoading={saving} colorScheme="blue">
            {productId ? "Update" : "Create"}
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
