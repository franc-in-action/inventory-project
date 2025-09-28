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

import { usePayments } from "../payments/contexts/PaymentsContext.jsx";

export default function AdjustmentDetail({ adjustmentId, isOpen, onClose }) {
  const { getAdjustment } = usePayments();
  const [adjustment, setAdjustment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !adjustmentId) return;

    setLoading(true);
    (async () => {
      try {
        const data = await getAdjustment(adjustmentId);
        setAdjustment(data);
      } catch (err) {
        console.error("Failed to fetch adjustment details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [adjustmentId, isOpen, getAdjustment]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adjustment Details</ModalHeader>
        <CloseBtn onClick={onClose} />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : adjustment ? (
            <VStack>
              <Text>
                <strong>ID:</strong> {adjustment.id}
              </Text>
              <Text>
                <strong>Customer:</strong> {adjustment.customer?.name || "N/A"}
              </Text>
              <Text>
                <strong>Amount:</strong> {adjustment.amount}
              </Text>
              <Text>
                <strong>Method:</strong> {adjustment.method}
              </Text>
              <Text>
                <strong>Description:</strong> {adjustment.description}
              </Text>
              <Text>
                <strong>Created At:</strong>{" "}
                {new Date(adjustment.createdAt).toLocaleString()}
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
