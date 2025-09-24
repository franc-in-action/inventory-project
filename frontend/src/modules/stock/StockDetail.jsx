import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { fetchStockMovements, fetchStockQuantity } from "./stockApi.js";

export default function StockDetail({
  productId,
  locationId,
  isOpen,
  onClose,
}) {
  const [movements, setMovements] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !productId || !locationId) return;
    setLoading(true);

    (async () => {
      try {
        const qty = await fetchStockQuantity(productId, locationId);
        const mov = await fetchStockMovements(productId, locationId);
        setQuantity(qty);
        setMovements(mov);
      } catch (err) {
        console.error("Failed to fetch stock details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, locationId, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Stock Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack align="start" spacing={2}>
              <Text>
                <strong>Current Quantity:</strong> {quantity}
              </Text>
              <Text>
                <strong>Movements:</strong>
              </Text>
              {movements.length ? (
                <VStack align="start" spacing={1}>
                  {movements.map((m) => (
                    <Text key={m.id}>
                      [{new Date(m.createdAt).toLocaleString()}]{" "}
                      {m.delta > 0 ? "+" : ""}
                      {m.delta} ({m.reason})
                    </Text>
                  ))}
                </VStack>
              ) : (
                <Text>No movements</Text>
              )}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
