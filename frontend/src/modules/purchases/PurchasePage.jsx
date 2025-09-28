import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Spacer,
  ButtonGroup,
  Spinner,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Link,
  Select,
} from "@chakra-ui/react";
import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useState } from "react";
import PurchaseForm from "./PurchaseForm.jsx";
import PurchaseDetails from "./PurchaseDetails.jsx";
import { useVendors } from "../vendors/contexts/VendorsContext.jsx";
import { usePurchases } from "./contexts/PurchasesContext.jsx";
import { useLocations } from "../locations/contexts/LocationsContext.jsx";

export default function PurchasesPage() {
  const toast = useToast();
  const { vendorsMap } = useVendors();
  const {
    purchases,
    loading,
    markReceived,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
  } = usePurchases();
  const { locations, loading: locationsLoading } = useLocations();

  const [showForm, setShowForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);

  const handleReceive = async (purchaseId) => {
    try {
      await markReceived(purchaseId);
      toast({ title: "Purchase received", status: "success" });
    } catch {
      toast({ title: "Error receiving purchase", status: "error" });
    }
  };

  const getLocationName = (id) =>
    locations.find((l) => l.id === id)?.name || id;

  const pendingPurchases = purchases.filter((p) => !p.received);
  const receivedPurchases = purchases.filter((p) => p.received);

  const renderPurchaseTable = (purchaseList, showReceiveButton = false) => (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
            Purchase #
          </Th>
          <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
            Vendor
          </Th>
          <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
            Location
          </Th>
          <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
            Total
          </Th>
          <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
            Received
          </Th>
          <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
            Received By
          </Th>
          <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
            Actions
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {purchaseList.length === 0 ? (
          <Tr>
            <Td colSpan={7} textAlign="center">
              No purchases found
            </Td>
          </Tr>
        ) : (
          purchaseList.map((p) => (
            <Tr key={p.id}>
              <Td>
                <Link variant="link" onClick={() => setSelectedPurchase(p)}>
                  {p.purchaseUuid}
                </Link>
              </Td>
              <Td>{vendorsMap[p.vendorId] || p.vendorId}</Td>
              <Td>{getLocationName(p.locationId)}</Td>
              <Td>${p.total.toFixed(2)}</Td>
              <Td>{p.received ? "Yes" : "No"}</Td>
              <Td>
                {p.receivedByUser
                  ? p.receivedByUser.name
                  : p.receivedBy
                  ? "Unknown User"
                  : "-"}
              </Td>
              <Td>
                {showReceiveButton && (
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => handleReceive(p.id)}
                  >
                    Receive
                  </Button>
                )}
              </Td>
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );

  if (loading || locationsLoading) return <Spinner />;

  return (
    <Flex direction="column" p={4}>
      {/* Header */}
      <Flex mb={4}>
        <Box p="2">
          <Heading size={"md"} mb={2}>
            Manage product purchases
          </Heading>
        </Box>
        <Spacer />
        <Flex mb={2} w="100%" maxW="600px" justify="flex-end">
          <ButtonGroup>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => setShowForm(true)}
            >
              New Purchase
            </Button>
          </ButtonGroup>
        </Flex>
      </Flex>

      {/* Tabs for Pending / Received */}
      <Tabs>
        <TabList>
          <Tab
            color={pendingPurchases.length > 0 ? "red.500" : "gray.500"}
            fontWeight={pendingPurchases.length > 0 ? "bold" : "normal"}
          >
            Pending ({pendingPurchases.length})
          </Tab>
          <Tab>Received ({receivedPurchases.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>{renderPurchaseTable(pendingPurchases, true)}</TabPanel>
          <TabPanel>{renderPurchaseTable(receivedPurchases)}</TabPanel>
        </TabPanels>
      </Tabs>

      {/* Pagination Controls */}
      <Flex mt={4} justify="space-between" align="center">
        <Button
          leftIcon={<ChevronLeftIcon />}
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>

        <Box>
          Page {page} of {totalPages}
        </Box>

        <Button
          rightIcon={<ChevronRightIcon />}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>

        <Select
          value={pageSize}
          onChange={(e) => setPageSize(parseInt(e.target.value))}
          w="120px"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </Select>
      </Flex>

      {/* Purchase Form Modal */}
      <PurchaseForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPurchase(null);
        }}
        locations={locations}
        purchase={editingPurchase}
      />

      {/* Purchase Details Modal */}
      <PurchaseDetails
        purchase={selectedPurchase}
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        onEdit={(purchase) => {
          setEditingPurchase(purchase);
          setShowForm(true);
          setSelectedPurchase(null);
        }}
        locations={locations}
      />
    </Flex>
  );
}
