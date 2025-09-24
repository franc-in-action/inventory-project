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
import { getPaymentById } from "./paymentsApi.js";

export default function PaymentDetail({ paymentId, isOpen, onClose }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !paymentId) return;
    setLoading(true);
    (async () => {
      try {
        const data = await getPaymentById(paymentId);
        setPayment(data);
      } catch (err) {
        console.error("Failed to fetch payment details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [paymentId, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Payment Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : payment ? (
            <VStack>
              <Text>
                <strong>Customer:</strong> {payment.customer?.name || "N/A"}
              </Text>
              <Text>
                <strong>Sale ID:</strong> {payment.saleId || "N/A"}
              </Text>
              <Text>
                <strong>Amount:</strong> {payment.amount}
              </Text>
              <Text>
                <strong>Method:</strong> {payment.method}
              </Text>
              <Text>
                <strong>Created At:</strong>{" "}
                {new Date(payment.createdAt).toLocaleString()}
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
