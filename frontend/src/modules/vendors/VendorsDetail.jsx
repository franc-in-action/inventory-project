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
import { fetchVendorById } from "./vendorsApi.js";

export default function VendorDetails({ vendorId, isOpen, onClose }) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !vendorId) return;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchVendorById(vendorId);
        setVendor(data);
      } catch (err) {
        console.error("Failed to fetch vendor details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [vendorId, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vendor Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : vendor ? (
            <VStack>
              <Text>
                <strong>Name:</strong> {vendor.name}
              </Text>
              <Text>
                <strong>Email:</strong> {vendor.email || "N/A"}
              </Text>
              <Text>
                <strong>Phone:</strong> {vendor.phone || "N/A"}
              </Text>
              <Text>
                <strong>Created At:</strong>{" "}
                {new Date(vendor.createdAt).toLocaleString()}
              </Text>
              <Text>
                <strong>Updated At:</strong>{" "}
                {new Date(vendor.updatedAt).toLocaleString()}
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
