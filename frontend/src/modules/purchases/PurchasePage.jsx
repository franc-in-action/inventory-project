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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { fetchPurchases, receivePurchase } from "./purchaseApi.js";
import { fetchLocations } from "../locations/locationsApi.js";
import { fetchVendors } from "../vendors/vendorsApi.js"; // <-- dynamic vendor fetch
import PurchaseForm from "./PurchaseForm.jsx";
import PurchaseDetails from "./PurchaseDetails.jsx";

export default function PurchasesPage() {
  const toast = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Load all purchases
  const loadPurchases = async () => {
    setLoading(true);
    try {
      const data = await fetchPurchases();
      setPurchases(data.items || []);
    } catch (err) {
      toast({
        title: "Error loading purchases",
        status: "error",
        description: err.message,
      });
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  // Load vendors dynamically from API
  const loadVendors = async () => {
    try {
      const vens = await fetchVendors();
      setVendors(vens || []);
    } catch {
      toast({ title: "Error loading vendors", status: "error" });
      setVendors([]);
    }
  };

  // Load locations dynamically
  const loadLocations = async () => {
    try {
      const locs = await fetchLocations();
      setLocations(locs || []);
    } catch {
      toast({ title: "Error loading locations", status: "error" });
      setLocations([]);
    }
  };

  // Handle receiving a purchase
  const handleReceive = async (purchaseId) => {
    try {
      await receivePurchase(purchaseId);
      toast({ title: "Purchase received", status: "success" });
      await loadPurchases();
    } catch {
      toast({ title: "Error receiving purchase", status: "error" });
    }
  };

  useEffect(() => {
    loadPurchases();
    loadVendors();
    loadLocations();
  }, []);

  const getVendorName = (id) => vendors.find((v) => v.id === id)?.name || id;
  const getLocationName = (id) =>
    locations.find((l) => l.id === id)?.name || id;

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

      <Table variant="striped" size="sm">
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
              <Td colSpan={6} textAlign="center">
                <Spinner />
              </Td>
            </Tr>
          ) : purchases.length === 0 ? (
            <Tr>
              <Td colSpan={6} textAlign="center">
                No purchases found
              </Td>
            </Tr>
          ) : (
            purchases.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <Button variant="link" onClick={() => setSelectedPurchase(p)}>
                    {p.purchaseUuid}
                  </Button>
                </Td>
                <Td>{getVendorName(p.vendorId)}</Td>
                <Td>{getLocationName(p.locationId)}</Td>
                <Td>${p.total.toFixed(2)}</Td>
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

      <PurchaseForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSaved={loadPurchases}
        vendors={vendors}
        locations={locations}
      />

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
