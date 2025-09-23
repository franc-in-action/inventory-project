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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useBreakpointValue,
} from "@chakra-ui/react";
import { fetchProducts, deleteProduct } from "../../utils/productsUtils.js";

export default function ProductsList({ onEdit, refreshKey }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDesktop = useBreakpointValue({ base: false, md: true });

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

      {isDesktop ? (
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>SKU</Th>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Location</Th>
              <Th isNumeric>Quantity</Th>
              <Th isNumeric>Price ($)</Th>
              <Th>Created</Th>
              <Th>Updated</Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((p) => (
              <Tr key={p.id}>
                <Td>{p.sku}</Td>
                <Td>{p.name}</Td>
                <Td>{p.description || "—"}</Td>
                <Td>{p.category?.name || "—"}</Td>
                {/* ✅ Show only the location name */}
                <Td>{p.location?.name || "—"}</Td>
                <Td isNumeric>{p.quantity}</Td>
                <Td isNumeric>{p.price}</Td>
                <Td>{new Date(p.createdAt).toLocaleDateString()}</Td>
                <Td>{new Date(p.updatedAt).toLocaleDateString()}</Td>
                <Td textAlign="right">
                  <HStack justify="flex-end">
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => onEdit(p.id)}
                    >
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
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <VStack align="stretch" spacing={3}>
          {products.map((p) => (
            <Flex
              key={p.id}
              direction="column"
              borderWidth={1}
              borderRadius="md"
              p={3}
              gap={2}
            >
              <Text fontWeight="bold">
                {p.sku} – {p.name}
              </Text>
              {p.description && <Text>Description: {p.description}</Text>}
              <Text>Category: {p.category?.name || "—"}</Text>
              {/* ✅ Show only the location name */}
              <Text>Location: {p.location?.name || "—"}</Text>
              <Text>Quantity: {p.quantity}</Text>
              <Text>Price: ${p.price}</Text>
              <Text>Created: {new Date(p.createdAt).toLocaleDateString()}</Text>
              <Text>Updated: {new Date(p.updatedAt).toLocaleDateString()}</Text>
              <HStack justify="flex-end" pt={2}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => onEdit(p.id)}
                >
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
      )}
    </Box>
  );
}
