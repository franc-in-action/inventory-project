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
  useDisclosure,
} from "@chakra-ui/react";
import { deleteProduct } from "./productsApi.js";
import { fetchCategories } from "./categoriesApi.js";
import { fetchLocations } from "../locations/locationsApi.js";
import {
  fetchStockForProducts,
  fetchTotalStockForProducts,
} from "../stock/stockApi.js";
import { useProducts } from "./contexts/ProductsContext.jsx";
import ProductDetails from "./ProductDetails.jsx";

export default function ProductsList({ onEdit, refreshKey }) {
  const { products } = useProducts();
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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleOpenDetails = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

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

  useEffect(() => {
    setLoading(false);
  }, [products]);

  useEffect(() => {
    const loadStock = async () => {
      if (!products.length) return setStockByProduct({});
      try {
        const ids = products.map((p) => p.id);
        const stock = locationId
          ? await fetchStockForProducts(ids, locationId)
          : await fetchTotalStockForProducts(ids);
        setStockByProduct(stock);
      } catch (err) {
        console.error("Failed to fetch stock:", err);
        setStockByProduct({});
      }
    };
    loadStock();
  }, [products, locationId]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error(err);
    }
  };

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

  if (loading) return <Spinner />;

  return (
    <Box>
      <Heading>Products</Heading>

      {/* Filters */}
      <HStack>
        <Input
          placeholder="Search name or SKU..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Select
          placeholder="Filter by Category"
          value={categoryId}
          onChange={(e) => {
            setPage(1);
            setCategoryId(e.target.value);
          }}
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
        <Table>
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
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginated.map((p) => (
              <Tr key={p.id}>
                <Td>{p.sku}</Td>
                <Td>
                  <Button onClick={() => handleOpenDetails(p)}>{p.name}</Button>
                </Td>
                <Td>{p.description || "—"}</Td>
                <Td>{p.category?.name || "—"}</Td>
                <Td>{p.location?.name || "—"}</Td>
                <Td isNumeric>{stockByProduct[p.id] ?? 0}</Td>
                <Td isNumeric>{p.price}</Td>
                <Td>{new Date(p.createdAt).toLocaleDateString()}</Td>
                <Td>{new Date(p.updatedAt).toLocaleDateString()}</Td>
                <Td>
                  <HStack>
                    <Button onClick={() => onEdit(p.id)}>Edit</Button>
                    <Button onClick={() => handleDelete(p.id)}>Delete</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <VStack>
          {paginated.map((p) => (
            <Flex key={p.id}>
              <Text>
                {p.sku} –{" "}
                <Button onClick={() => handleOpenDetails(p)}>{p.name}</Button>
              </Text>
              {p.description && <Text>Description: {p.description}</Text>}
              <Text>Category: {p.category?.name || "—"}</Text>
              <Text>Location: {p.location?.name || "—"}</Text>
              <Text>Quantity: {stockByProduct[p.id] ?? 0}</Text>
              <Text>Price: ${p.price}</Text>
              <Text>Created: {new Date(p.createdAt).toLocaleDateString()}</Text>
              <Text>Updated: {new Date(p.updatedAt).toLocaleDateString()}</Text>
              <HStack>
                <Button onClick={() => onEdit(p.id)}>Edit</Button>
                <Button onClick={() => handleDelete(p.id)}>Delete</Button>
              </HStack>
            </Flex>
          ))}
        </VStack>
      )}

      {/* Pagination */}
      <HStack>
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Text>
          Page {page} of {totalPages}
        </Text>
        <Button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </HStack>

      {selectedProduct && (
        <ProductDetails
          isOpen={isOpen}
          onClose={onClose}
          product={selectedProduct}
          stock={stockByProduct[selectedProduct.id] ?? 0}
        />
      )}
    </Box>
  );
}
