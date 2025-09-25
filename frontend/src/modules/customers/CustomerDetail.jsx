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
import { useCustomers } from "./contexts/CustomersContext.jsx";

export default function CustomerDetail({ customerId, isOpen, onClose }) {
  const { fetchCustomerById } = useCustomers();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !customerId) return;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchCustomerById(customerId);
        setCustomer(data);
      } catch (err) {
        console.error("Failed to fetch customer details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId, isOpen, fetchCustomerById]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Customer Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : customer ? (
            <VStack align="start">
              <Text>
                <strong>Name:</strong> {customer.name}
              </Text>
              <Text>
                <strong>Email:</strong> {customer.email || "N/A"}
              </Text>
              <Text>
                <strong>Phone:</strong> {customer.phone || "N/A"}
              </Text>
              <Text>
                <strong>Created At:</strong>{" "}
                {new Date(customer.createdAt).toLocaleString()}
              </Text>
              <Text>
                <strong>Updated At:</strong>{" "}
                {new Date(customer.updatedAt).toLocaleString()}
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
