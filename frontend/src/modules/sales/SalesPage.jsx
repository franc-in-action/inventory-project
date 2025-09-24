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
  ButtonGroup,
  Spacer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { fetchSales } from "./salesApi.js";
import SalesList from "./SalesList.jsx";
import InvoiceDetails from "./InvoiceDetails.jsx";
import SaleInvoiceThermal from "./SaleInvoiceThermal.jsx";
import InvoiceForm from "./InvoiceForm.jsx";

export default function SalesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [allSales, setAllSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedSale, setSelectedSale] = useState(null);
  const [thermalOpen, setThermalOpen] = useState(false);
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);

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

  useEffect(() => {
    loadSales();
  }, []);

  const filtered = useMemo(() => {
    return allSales.filter(
      (s) =>
        s.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.saleUuid || s.id)
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [allSales, search]);

  // Split sales into paid vs unpaid/partial
  const paidSales = filtered.filter((s) => s.status?.toLowerCase() === "paid");
  const unpaidSales = filtered.filter(
    (s) => s.status?.toLowerCase() !== "paid"
  );

  const totalPages = (salesArray) =>
    Math.max(1, Math.ceil(salesArray.length / limit));

  const paginated = (salesArray) => {
    const start = (page - 1) * limit;
    return salesArray.slice(start, start + limit);
  };

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
      <Flex minWidth="max-content" alignItems="center" gap="2" mb={4}>
        <Box p="2">
          <Heading size="md">Invoices</Heading>
        </Box>
        <Spacer />
        <ButtonGroup gap="2">
          <Button
            variant={"primary"}
            leftIcon={<AddIcon />}
            onClick={() => setInvoiceFormOpen(true)}
          >
            Invoice
          </Button>
        </ButtonGroup>
      </Flex>

      <Input
        mb={4}
        placeholder="Search by customer or Invoice No..."
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Paid</Tab>
          <Tab>Unpaid / Partial / Credit</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <SalesList
              sales={paginated(paidSales)}
              onSelectSale={handleSelectSale}
              onPrint={handlePrint}
            />
            <HStack mt={2}>
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                isDisabled={page === 1}
              >
                Previous
              </Button>
              <Text>
                Page {page} of {totalPages(paidSales)}
              </Text>
              <Button
                onClick={() =>
                  setPage((p) => Math.min(totalPages(paidSales), p + 1))
                }
                isDisabled={page === totalPages(paidSales)}
              >
                Next
              </Button>
            </HStack>
          </TabPanel>

          <TabPanel>
            <SalesList
              sales={paginated(unpaidSales)}
              onSelectSale={handleSelectSale}
              onPrint={handlePrint}
            />
            <HStack mt={2}>
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                isDisabled={page === 1}
              >
                Previous
              </Button>
              <Text>
                Page {page} of {totalPages(unpaidSales)}
              </Text>
              <Button
                onClick={() =>
                  setPage((p) => Math.min(totalPages(unpaidSales), p + 1))
                }
                isDisabled={page === totalPages(unpaidSales)}
              >
                Next
              </Button>
            </HStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Invoice Details Modal */}
      {selectedSale && (
        <InvoiceDetails sale={selectedSale} isOpen={isOpen} onClose={onClose} />
      )}

      {/* Thermal Print Modal */}
      {selectedSale && (
        <SaleInvoiceThermal
          sale={selectedSale}
          isOpen={thermalOpen}
          onClose={() => setThermalOpen(false)}
        />
      )}

      {/* Invoice Form Modal */}
      <InvoiceForm
        isOpen={invoiceFormOpen}
        onClose={() => setInvoiceFormOpen(false)}
        onInvoiceCreated={() => {
          setInvoiceFormOpen(false);
          loadSales();
        }}
      />
    </Box>
  );
}
