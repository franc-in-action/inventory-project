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
import { CloseBtn } from "../../components/Xp.jsx"; // import your custom CloseBtn

import { usePayments } from "./contexts/PaymentsContext.jsx";

export default function PaymentDetail({ paymentId, isOpen, onClose }) {
  const { getPayment } = usePayments();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !paymentId) return;

    setLoading(true);
    (async () => {
      try {
        const data = await getPayment(paymentId);
        setPayment(data);
      } catch (err) {
        console.error("Failed to fetch payment details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [paymentId, isOpen, getPayment]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Payment Details</ModalHeader>
        <CloseBtn onClick={onClose} />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : payment ? (
            <VStack>
              <Text>
                <strong>Payment #:</strong> {payment.paymentNumber || "N/A"}
              </Text>
              <Text>
                <strong>Customer:</strong> {payment.customer?.name || "N/A"}
              </Text>
              <Text>
                <strong>Sale UUID:</strong> {payment.sale?.saleUuid || "N/A"}
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
