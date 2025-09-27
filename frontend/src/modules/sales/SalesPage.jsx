import { useState } from "react";
import {
  Box,
  Flex,
  Button,
  Heading,
  Input,
  HStack,
  Spinner,
  Text,
  Spacer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  ButtonGroup,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

import { useSales } from "./contexts/SalesContext.jsx";
import SalesList from "./SalesList.jsx";
import InvoiceDetails from "./InvoiceDetails.jsx";
import SaleInvoiceThermal from "./SaleInvoiceThermal.jsx";
import InvoiceForm from "./InvoiceForm.jsx";

export default function SalesPage() {
  const { sales, drafts, deleted, loading, reloadSales } = useSales(); // ✅ include deleted
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [thermalOpen, setThermalOpen] = useState(false);
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);

  // --- search filter ---
  const filterBySearch = (list) =>
    list.filter(
      (s) =>
        s.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.saleUuid?.toLowerCase().includes(search.toLowerCase())
    );

  // categorize
  const completedSales = sales.filter((s) => s.status === "COMPLETE");

  const filteredCompleted = filterBySearch(completedSales);
  const filteredDrafts = filterBySearch(drafts);
  const filteredDeleted = filterBySearch(deleted); // ✅ use context deleted

  // within completed → split paid vs unpaid
  const paidSales = filteredCompleted.filter((s) => {
    const paid = s.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    return paid >= (s.total || 0);
  });
  const unpaidSales = filteredCompleted.filter((s) => {
    const paid = s.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    return paid < (s.total || 0);
  });

  const totalPages = (salesArray) =>
    Math.max(1, Math.ceil(salesArray.length / limit));
  const paginated = (salesArray) => {
    const start = (page - 1) * limit;
    return salesArray.slice(start, start + limit);
  };

  const handleSelectSale = (sale) => setSelectedSaleId(sale.id);
  const handlePrint = (sale) => {
    setSelectedSaleId(sale.id);
    setThermalOpen(true);
  };

  if (loading) return <Spinner />;

  return (
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size={"md"} mb={2}>
            Manage sales and invoices
          </Heading>
        </Box>
        <Spacer />

        <Flex mb={2} w="100%" maxW="600px" justify="flex-end">
          <ButtonGroup>
            <Button
              colorScheme="blue"
              leftIcon={<AddIcon />}
              onClick={() => setInvoiceFormOpen(true)}
            >
              Invoice
            </Button>
          </ButtonGroup>
        </Flex>
      </Flex>

      <Flex mb={4} w="100%">
        <Input
          placeholder="Search customers or Invoice No..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </Flex>

      {/* === TOP LEVEL TABS === */}
      <Tabs>
        <TabList>
          <Tab>Pending (Drafts)</Tab>
          <Tab>Completed Sales</Tab>
          <Tab>Cancelled Sales</Tab>
        </TabList>

        <TabPanels>
          {/* PENDING */}
          <TabPanel>
            <SalesList
              sales={paginated(filteredDrafts)}
              onSelectSale={handleSelectSale}
              onPrint={handlePrint}
            />
          </TabPanel>

          {/* COMPLETED with nested tabs */}
          <TabPanel>
            <Tabs>
              <TabList>
                <Tab>Unpaid / Partial</Tab>
                <Tab>Paid</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <SalesList
                    sales={paginated(unpaidSales)}
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
                <TabPanel>
                  <SalesList
                    sales={paginated(paidSales)}
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
              </TabPanels>
            </Tabs>
          </TabPanel>

          {/* DELETED */}
          <TabPanel>
            <SalesList
              sales={paginated(filteredDeleted)}
              onSelectSale={handleSelectSale}
              onPrint={handlePrint}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {selectedSaleId && (
        <InvoiceDetails
          saleId={selectedSaleId}
          isOpen={!!selectedSaleId}
          onClose={() => setSelectedSaleId(null)}
        />
      )}

      {selectedSaleId && (
        <SaleInvoiceThermal
          saleId={selectedSaleId}
          isOpen={thermalOpen}
          onClose={() => setThermalOpen(false)}
        />
      )}

      <InvoiceForm
        isOpen={invoiceFormOpen}
        onClose={() => setInvoiceFormOpen(false)}
        onInvoiceCreated={() => {
          setInvoiceFormOpen(false);
          reloadSales();
        }}
      />
    </Flex>
  );
}
