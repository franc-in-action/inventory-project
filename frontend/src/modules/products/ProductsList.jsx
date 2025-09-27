import { useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Link,
  Input,
  Select,
  Button,
  Spinner,
  Flex,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { useProducts } from "./contexts/ProductsContext.jsx";
import { useCategories } from "../categories/contexts/CategoriesContext.jsx";
import { useLocations } from "../locations/contexts/LocationsContext.jsx";
import ProductsTable from "./ProductsTable.jsx";

export default function ProductsList({ onEdit }) {
  const {
    products,
    stockMap,
    reloadProducts,
    deleteProductById,
    openProductDetails, // ✅ use context-provided modal function
  } = useProducts();
  const { categories } = useCategories();
  const { locations, loading: locationsLoading } = useLocations();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;
  const toast = useToast();
  const isDesktop = useBreakpointValue({ base: false, md: true });

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await deleteProductById(id);
      toast({
        title: "Product deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await reloadProducts();
    } catch (err) {
      toast({
        title: "Oops! Error deleting product",
        description: err?.message || "Unexpected error",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
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

  if (!products.length || locationsLoading) return <Spinner />;

  return (
    <Box>
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

      {isDesktop ? (
        <ProductsTable
          products={paginated}
          stockByProduct={stockMap}
          onEdit={onEdit}
          onDelete={handleDelete}
          // ✅ directly call context function to open modal
          onOpenDetails={(p) => openProductDetails(p.id, locationId)}
        />
      ) : (
        <VStack spacing={4}>
          {paginated.map((p) => (
            <Flex
              key={p.id}
              direction="column"
              p={3}
              borderWidth="1px"
              borderRadius="md"
              w="100%"
            >
              {p.sku} –{" "}
              <Link onClick={() => openProductDetails(p.id, locationId)}>
                {p.name}
              </Link>
              <Text>Description: {p.description || "—"}</Text>
              <Text>Category: {p.category?.name || "—"}</Text>
              <Text>
                Location:{" "}
                {locations.find((l) => l.id === p.locationId)?.name || "—"}
              </Text>
              <Text>Quantity: {stockMap[p.id] ?? 0}</Text>
              <Text>Price: ${p.price}</Text>
              <HStack mt={2}>
                <Button onClick={() => onEdit(p.id)}>Edit</Button>
                <Button onClick={() => handleDelete(p.id)}>Delete</Button>
              </HStack>
            </Flex>
          ))}
        </VStack>
      )}

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
    </Box>
  );
}
