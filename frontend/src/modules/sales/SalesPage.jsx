import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Button,
  Heading,
  Input,
  HStack,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { fetchSales } from "./salesApi.js";
import SalesList from "./SalesList.jsx";
import InvoiceDetails from "./InvoiceDetails.jsx";
import SaleInvoiceThermal from "./SaleInvoiceThermal.jsx";

export default function SalesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [allSales, setAllSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedSale, setSelectedSale] = useState(null);
  const [thermalOpen, setThermalOpen] = useState(false);

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      try {
        const data = await fetchSales();
        setAllSales(data.items || []);
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

  const handleSelectSale = (sale) => {
    setSelectedSale(sale);
    onOpen();
  };

  const handlePrint = (sale) => {
    setSelectedSale(sale);
    setThermalOpen(true);
  };

  if (loading) return <Spinner />;

  return (
    <Box>
      <Flex>
        <Heading>Invoices</Heading>
      </Flex>

      <Input
        placeholder="Search by customer or sale ID..."
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      <SalesList
        sales={paginated}
        onSelectSale={handleSelectSale}
        onPrint={handlePrint}
      />

      <HStack>
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

      {selectedSale && (
        <InvoiceDetails sale={selectedSale} isOpen={isOpen} onClose={onClose} />
      )}

      {selectedSale && (
        <SaleInvoiceThermal
          sale={selectedSale}
          isOpen={thermalOpen}
          onClose={() => setThermalOpen(false)}
        />
      )}
    </Box>
  );
}
