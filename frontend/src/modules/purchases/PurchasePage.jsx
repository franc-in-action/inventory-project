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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useState } from "react";
import PurchaseForm from "./PurchaseForm.jsx";
import PurchaseDetails from "./PurchaseDetails.jsx";
import { useVendors } from "../vendors/contexts/VendorsContext.jsx";
import { usePurchases } from "./contexts/PurchasesContext.jsx";
import { useLocations } from "../locations/contexts/LocationsContext.jsx";

export default function PurchasesPage() {
  const toast = useToast();
  const { vendorsMap } = useVendors();
  const { purchases, loading, markReceived } = usePurchases();
  const { locations, loading: locationsLoading } = useLocations();

  const [showForm, setShowForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);

  const handleReceive = async (purchaseId) => {
    try {
      await markReceived(purchaseId); // still uses internal UUID
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
    <Table variant="striped" size="sm">
      <Thead>
        <Tr>
          {/* ✅ Column header updated */}
          <Th>Purchase #</Th>
          <Th>Vendor</Th>
          <Th>Location</Th>
          <Th>Total</Th>
          <Th>Received</Th>
          <Th>Received By</Th>
          <Th>Actions</Th>
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
              {/* ✅ Show human-readable purchase number */}
              <Td>
                <Button variant="link" onClick={() => setSelectedPurchase(p)}>
                  {p.purchaseUuid}
                </Button>
              </Td>
              <Td>{vendorsMap[p.vendorId] || p.vendorId}</Td>
              <Td>{getLocationName(p.locationId)}</Td>
              <Td>${p.total.toFixed(2)}</Td>
              <Td>{p.received ? "Yes" : "No"}</Td>
              <Td>
                {p.receivedByUser ? p.receivedByUser.name : p.receivedBy || "-"}
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
    <Box>
      <Flex align="center" mb={4}>
        <Heading size="md">Purchases</Heading>
        <Spacer />
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

      <Tabs variant="enclosed">
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

      <PurchaseForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPurchase(null);
        }}
        locations={locations}
        purchase={editingPurchase}
      />

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
    </Box>
  );
}
