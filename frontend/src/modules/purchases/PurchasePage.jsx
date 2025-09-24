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
import { fetchPurchases, receivePurchase } from "./purchaseApi.js";
import { fetchLocations } from "../locations/locationsApi.js";
import PurchaseForm from "./PurchaseForm.jsx";
import PurchaseDetails from "./PurchaseDetails.jsx";

export default function PurchasesPage() {
  const toast = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [totalPurchases, setTotalPurchases] = useState(0);

  async function loadPurchases() {
    setLoading(true);
    try {
      const data = await fetchPurchases();
      setPurchases(data.items || []);
      setTotalPurchases(data.total || 0);
    } catch {
      toast({ title: "Error loading purchases", status: "error" });
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadLocations() {
    try {
      const locs = await fetchLocations();
      setLocations(locs || []);
    } catch {
      toast({ title: "Error loading locations", status: "error" });
    }
  }

  async function handleReceive(purchaseId) {
    try {
      await receivePurchase(purchaseId);
      toast({ title: "Purchase received", status: "success" });
      const data = await fetchPurchases();
      setPurchases(data.items || []);
    } catch {
      toast({ title: "Error receiving purchase", status: "error" });
    }
  }

  useEffect(() => {
    loadPurchases();
    loadLocations();
    setVendors([
      { id: 1, name: "Vendor A" },
      { id: 2, name: "Vendor B" },
    ]);
  }, []);

  const getLocationName = (id) =>
    locations.find((l) => l.id === id)?.name || id;
  const getVendorName = (id) => vendors.find((v) => v.id === id)?.name || id;

  return (
    <Box>
      <Heading>Purchases</Heading>
      <Flex>
        <Button onClick={() => setShowModal(true)}>+ New</Button>
      </Flex>

      <Table>
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
                <Spinner />
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
                  <Button variant="link" onClick={() => setSelectedPurchase(p)}>
                    {p.purchaseUuid}
                  </Button>
                </Td>
                <Td>{getVendorName(p.vendorId)}</Td>
                <Td>{getLocationName(p.locationId)}</Td>
                <Td>{p.total}</Td>
                <Td>{p.received ? "Yes" : "No"}</Td>
                <Td>
                  {!p.received && (
                    <Button onClick={() => handleReceive(p.id)}>Receive</Button>
                  )}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <PurchaseForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
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
