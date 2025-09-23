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
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { fetchPurchases, receivePurchase } from "../../utils/purchasesUtils.js";
import { fetchLocations } from "../../utils/locationsUtils.js";
import PurchaseForm from "./PurchaseForm.jsx";
import PurchaseDetails from "./PurchaseDetails.jsx";

export default function PurchasesPage() {
  const toast = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [vendors, setVendors] = useState([]); // dynamically loaded or static
  const [locations, setLocations] = useState([]);

  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [totalPurchases, setTotalPurchases] = useState(0);

  // Load purchases
  async function loadPurchases() {
    setLoading(true);
    try {
      const data = await fetchPurchases(); // { items, total }
      setPurchases(data.items || []); // <-- use data.items
      setTotalPurchases(data.total || 0);
    } catch (err) {
      toast({ title: "Error loading purchases", status: "error" });
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }

  // Load locations dynamically
  async function loadLocations() {
    try {
      const locs = await fetchLocations();
      setLocations(locs || []);
    } catch (err) {
      console.error("Failed to load locations:", err);
      toast({ title: "Error loading locations", status: "error" });
    }
  }

  async function handleReceive(purchaseId) {
    try {
      await receivePurchase(purchaseId);
      toast({ title: "Purchase received", status: "success" });
      const data = await fetchPurchases();
      setPurchases(data.items || []); // <-- reload properly
    } catch (err) {
      toast({ title: "Error receiving purchase", status: "error" });
    }
  }

  useEffect(() => {
    loadPurchases();
    loadLocations();

    // Example vendors if you don’t fetch dynamically
    setVendors([
      { id: 1, name: "Vendor A" },
      { id: 2, name: "Vendor B" },
    ]);
  }, []);

  // Helper to get name by ID
  const getLocationName = (id) =>
    locations.find((l) => l.id === id)?.name || id;
  const getVendorName = (id) => vendors.find((v) => v.id === id)?.name || id;

  return (
    <Box p={4}>
      <Heading mb={4}>Purchases</Heading>

      <Flex mb={4}>
        <Button colorScheme="blue" onClick={() => setShowModal(true)}>
          + New
        </Button>
      </Flex>

      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>UUID</Th>
            <Th>Vendor</Th>
            <Th>Location</Th>
            <Th>Total</Th>
            <Th>Received</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            <Tr>
              <Td colSpan={6}>
                <Spinner margin="auto" />
              </Td>
            </Tr>
          ) : purchases.length === 0 ? (
            <Tr>
              <Td colSpan={6}>No purchases found</Td>
            </Tr>
          ) : (
            purchases.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <Button
                    variant="link"
                    colorScheme="blue"
                    onClick={() => setSelectedPurchase(p)}
                  >
                    {p.purchaseUuid}
                  </Button>
                </Td>

                <Td>{getVendorName(p.vendorId)}</Td>
                <Td>{getLocationName(p.locationId)}</Td>
                <Td>{p.total}</Td>
                <Td>{p.received ? "Yes" : "No"}</Td>
                <Td>
                  {!p.received && (
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

      {/* Purchase Modal */}
      <PurchaseForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={loadPurchases}
        vendors={vendors}
        locations={locations}
      />

      {/* Purchase Details Modal */}
      <PurchaseDetails
        purchase={selectedPurchase}
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        onSaved={loadPurchases}
        vendors={vendors}
        locations={locations}
      />
    </Box>
  );
}
