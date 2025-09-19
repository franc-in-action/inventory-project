import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Button,
  HStack,
  Spinner,
} from "@chakra-ui/react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function ProductsList({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${backendUrl}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${backendUrl}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Spinner />;

  return (
    <Box>
      <Heading mb={4}>Products</Heading>
      <VStack align="stretch" spacing={3}>
        {products.map((p) => (
          <HStack
            key={p.id}
            borderWidth={1}
            borderRadius="md"
            p={3}
            justify="space-between"
          >
            <Box>
              {p.sku} - {p.name} (${p.price})
            </Box>
            <HStack>
              <Button size="sm" colorScheme="blue" onClick={() => onEdit(p.id)}>
                Edit
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => handleDelete(p.id)}
              >
                Delete
              </Button>
            </HStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
