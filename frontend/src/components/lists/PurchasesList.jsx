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
  VStack,
  Text,
} from "@chakra-ui/react";
import { fetchPurchases, receivePurchase } from "../utils/purchasesUtils.js";
import PurchaseForm from "../components/modals/PurchaseForm.jsx";

export default function PurchasesList() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const vendors = [
    { id: 1, name: "Vendor A" },
    { id: 2, name: "Vendor B" },
  ]; // Example, fetch from backend in real app

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

  const handleReceive = async (id) => {
    await receivePurchase(id);
    loadPurchases();
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  return (
    <Box p={4}>
      <Heading mb={4}>Purchases</Heading>
      <Button colorScheme="blue" mb={4} onClick={() => setShowForm(true)}>
        New Purchase
      </Button>

      {loading ? (
        <Spinner size="xl" margin="auto" />
      ) : purchases.length === 0 ? (
        <Text>No purchases found</Text>
      ) : (
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
            {purchases.map((p) => (
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

                <Td>{p.vendorId}</Td>
                <Td>{p.locationId}</Td>
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
