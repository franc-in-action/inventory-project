import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Button,
  HStack,
  Spinner,
  Flex,
  Text,
} from "@chakra-ui/react";
import { fetchProducts, deleteProduct } from "../utils/productsUtils.js";

export default function ProductsList({ onEdit, refreshKey }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Spinner />;

  return (
    <Box w="full">
      <Heading mb={4}>Products</Heading>
      <VStack align="stretch" spacing={3}>
        {products.map((p) => (
          <Flex
            key={p.id}
            direction={{ base: "column", sm: "row" }}
            borderWidth={1}
            borderRadius="md"
            p={3}
            justify="space-between"
            align={{ base: "stretch", sm: "center" }}
            gap={2}
          >
            <Text flex="1">
              {p.sku} – {p.name} (${p.price})
            </Text>
            <HStack justify={{ base: "flex-end", sm: "initial" }}>
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
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}
