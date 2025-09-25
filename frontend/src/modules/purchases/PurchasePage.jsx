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
import { useEffect, useState } from "react";
import { fetchLocations } from "../locations/locationsApi.js";
import PurchaseForm from "./PurchaseForm.jsx";
import PurchaseDetails from "./PurchaseDetails.jsx";
import { useVendors } from "../vendors/contexts/VendorsContext.jsx";
import { usePurchases } from "./contexts/PurchasesContext.jsx";

export default function PurchasesPage() {
  const toast = useToast();
  const { vendors, vendorsMap } = useVendors();
  const { purchases, loading, loadPurchases, markReceived } = usePurchases();

  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);

  const loadLocationsData = async () => {
    try {
      const locs = await fetchLocations();
      setLocations(locs || []);
    } catch {
      toast({ title: "Error loading locations", status: "error" });
      setLocations([]);
    }
  };

  useEffect(() => {
    loadPurchases();
    loadLocationsData();
  }, [loadPurchases]);

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
    <Table variant="striped" size="sm">
      <Thead>
        <Tr>
          <Th>UUID</Th>
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
            Purchase
          </Button>
        </ButtonGroup>
      </Flex>

      {loading ? (
        <Spinner />
      ) : (
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
      )}

      <PurchaseForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPurchase(null);
        }}
        // onSaved={loadPurchases}
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
