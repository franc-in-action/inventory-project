import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  VStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import CloseBtn from "../../components/CloseBtn.jsx"; // import your custom CloseBtn

import { useSales } from "../sales/contexts/SalesContext.jsx";

export default function ReturnDetail({ returnId, isOpen, onClose }) {
  const { getReturnById } = useSales();
  const [returnData, setReturnData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !returnId) return;

    setLoading(true);
    (async () => {
      try {
        const data = getReturnById(returnId);
        setReturnData(data);
      } catch (err) {
        console.error("Failed to fetch return details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [returnId, isOpen, getReturnById]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Return Details</ModalHeader>
        <CloseBtn onClick={onClose} />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : returnData ? (
            <VStack>
              <Text>
                <strong>ID:</strong> {returnData.id}
              </Text>
              <Text>
                <strong>Customer:</strong>{" "}
                {returnData.customer?.name || "Walk-in"}
              </Text>
              <Text>
                <strong>Items:</strong> {returnData.items?.length || 0}
              </Text>
              <Text>
                <strong>Total:</strong>{" "}
                {returnData.items
                  ?.reduce((sum, i) => sum + i.qty * i.price, 0)
                  .toFixed(2)}
              </Text>
              <Text>
                <strong>Created At:</strong>{" "}
                {new Date(returnData.createdAt).toLocaleString()}
              </Text>
            </VStack>
          ) : (
            <Text>No data available</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
