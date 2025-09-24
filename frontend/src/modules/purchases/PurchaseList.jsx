import { useState, useEffect } from "react";
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
  Spinner,
  Text,
} from "@chakra-ui/react";
import { fetchPurchases, receivePurchase } from "../utils/purchasesApi.js";
import { fetchVendors } from "../vendors/vendorsApi.js"; // Assuming you have a vendor API
import PurchaseForm from "../components/modals/PurchaseForm.jsx";

export default function PurchasesList() {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Load purchases
  const loadPurchases = async () => {
    setLoading(true);
    try {
      const { purchases: data } = await fetchPurchases();
      setPurchases(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load vendors from vendor module
  const loadVendors = async () => {
    try {
      const data = await fetchVendors();
      setVendors(data || []);
    } catch (err) {
      console.error("Failed to load vendors:", err);
      setVendors([]);
    }
  };

  // Handle receiving a purchase
  const handleReceive = async (id) => {
    try {
      await receivePurchase(id);
      await loadPurchases();
    } catch (err) {
      console.error("Failed to receive purchase:", err);
    }
  };

  useEffect(() => {
    loadPurchases();
    loadVendors();
  }, []);

  const getVendorName = (id) => vendors.find((v) => v.id === id)?.name || id;

  return (
    <Box>
      <Heading mb={4}>Purchases</Heading>
      <Button mb={4} onClick={() => setShowForm(true)}>
        New Purchase
      </Button>

      {loading ? (
        <Spinner />
      ) : purchases.length === 0 ? (
        <Text>No purchases found</Text>
      ) : (
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
            {purchases.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <Button variant="link" onClick={() => setSelectedPurchase(p)}>
                    {p.purchaseUuid}
                  </Button>
                </Td>
                <Td>{getVendorName(p.vendorId)}</Td>
                <Td>{p.locationId}</Td>
                <Td>{p.total}</Td>
                <Td>{p.received ? "Yes" : "No"}</Td>
                <Td>
                  {!p.received && (
                    <Button size="sm" onClick={() => handleReceive(p.id)}>
                      Receive
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <PurchaseForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSaved={loadPurchases}
        vendors={vendors}
      />
    </Box>
  );
}
