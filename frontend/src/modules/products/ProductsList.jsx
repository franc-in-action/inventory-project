import { useState, useEffect, useMemo } from "react";
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
  Input,
  Select,
  useBreakpointValue,
} from "@chakra-ui/react";
import { deleteProduct } from "./productsApi.js";
import { fetchCategories } from "./categoriesApi.js";
import { fetchLocations } from "../locations/locationsApi.js";
import {
  fetchStockForProducts,
  fetchTotalStockForProducts,
} from "../../utils/stockApi.js";
import { useProducts } from "./contexts/ProductsContext.jsx"; // ✅ use context

export default function ProductsList({ onEdit, refreshKey }) {
  const { products } = useProducts(); // ✅ get products from context
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockByProduct, setStockByProduct] = useState({});

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const isDesktop = useBreakpointValue({ base: false, md: true });

  // -----------------------
  // Fetch categories & locations
  // -----------------------
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cats, locs] = await Promise.all([
          fetchCategories(),
          fetchLocations(),
        ]);
        setCategories(cats);
        setLocations(locs);
      } catch (err) {
        console.error("Failed to fetch meta:", err);
      }
    };
    loadMeta();
  }, []);

  // -----------------------
  // Update total products count
  // -----------------------
  useEffect(() => {
    setTotalProducts(products.length);
    setLoading(false);
  }, [products]);

  // -----------------------
  // Fetch stock whenever products or location change
  // -----------------------
  useEffect(() => {
    const loadStock = async () => {
      if (!products.length) return setStockByProduct({});
      try {
        const productIds = products.map((p) => p.id);
        const stock = locationId
          ? await fetchStockForProducts(productIds, locationId)
          : await fetchTotalStockForProducts(productIds);
        setStockByProduct(stock);
      } catch (err) {
        console.error("Failed to fetch stock:", err);
        setStockByProduct({});
      }
    };
    loadStock();
  }, [products, locationId]);

  // -----------------------
  // Delete product
  // -----------------------
  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // Client-side filters
  // -----------------------
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryId ? p.categoryId === categoryId : true;
      const matchLoc = locationId ? p.locationId === locationId : true;
      return matchSearch && matchCat && matchLoc;
    });
  }, [products, search, categoryId, locationId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

  if (loading) return <Spinner size="xl" margin="auto" />;

  // -----------------------
  // Render
  // -----------------------
  return (
    <Box w="full">
      <Heading mb={4}>Products</Heading>

      {/* Filters */}
      <HStack spacing={3} mb={4} flexWrap="wrap">
        <Input
          placeholder="Search name or SKU..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          w={{ base: "100%", md: "200px" }}
        />
        <Select
          placeholder="Filter by Category"
          value={categoryId}
          onChange={(e) => {
            setPage(1);
            setCategoryId(e.target.value);
          }}
          w={{ base: "100%", md: "200px" }}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          placeholder="Filter by Location"
          value={locationId}
          onChange={(e) => {
            setPage(1);
            setLocationId(e.target.value);
          }}
          w={{ base: "100%", md: "200px" }}
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
      </HStack>

      {/* Desktop Table */}
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
            {paginated.map((p) => (
              <Tr key={p.id}>
                <Td>{p.sku}</Td>
                <Td>{p.name}</Td>
                <Td>{p.description || "—"}</Td>
                <Td>{p.category?.name || "—"}</Td>
                <Td>{p.location?.name || "—"}</Td>
                <Td isNumeric>{stockByProduct[p.id] ?? 0}</Td>
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
          {paginated.map((p) => (
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
              <Text>Location: {p.location?.name || "—"}</Text>
              <Text>Quantity: {stockByProduct[p.id] ?? 0}</Text>
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

      {/* Pagination */}
      <HStack justify="center" mt={4}>
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          isDisabled={page === 1}
        >
          Previous
        </Button>
        <Text>
          Page {page} of {totalPages}
        </Text>
        <Button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          isDisabled={page === totalPages}
        >
          Next
        </Button>
      </HStack>
    </Box>
  );
}
