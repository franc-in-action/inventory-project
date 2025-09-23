// src/pages/SalesPage.jsx
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Button,
  Heading,
  Input,
  VStack,
  HStack,
  Spinner,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { fetchSales } from "../utils/salesUtils.js";
import CashierModal from "../components/modals/CashierModal.jsx";
import SalesList from "../components/lists/SalesList.jsx";

export default function SalesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [allSales, setAllSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & filters
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Load sales
  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      try {
        const data = await fetchSales();
        setAllSales(data);
      } catch (err) {
        console.error(err);
        setAllSales([]);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
  }, []);

  const filtered = useMemo(() => {
    return allSales.filter(
      (s) =>
        s.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toString().includes(search)
    );
  }, [allSales, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

  if (loading) return <Spinner size="xl" margin={"auto"} />;

  return (
    <Box w="full" maxW="container.lg" mx="auto" p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Sales</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          + New
        </Button>
      </Flex>

      <Input
        placeholder="Search by customer or sale ID..."
        mb={4}
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      <SalesList sales={paginated} />

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

      {/* Cashier Modal */}
      <CashierModal
        isOpen={isOpen}
        onClose={onClose}
        onSaleCreated={async () => {
          setLoading(true);
          try {
            const data = await fetchSales();
            setAllSales(data);
          } finally {
            setLoading(false);
          }
        }}
      />
    </Box>
  );
}
