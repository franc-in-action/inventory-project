// src/modules/locations/LocationDetails.jsx
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
import { fetchLocationById } from "./locationsApi.js";

export default function LocationDetails({ locationId, isOpen, onClose }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !locationId) return;

    setLoading(true);
    (async () => {
      try {
        const data = await fetchLocationById(locationId);
        setLocation(data);
      } catch (err) {
        console.error("Failed to fetch location details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [locationId, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Location Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner size="xl" margin="auto" />
          ) : location ? (
            <VStack spacing={3} align="start">
              <Text>
                <strong>Name:</strong> {location.name}
              </Text>
              <Text>
                <strong>Address:</strong> {location.address || "N/A"}
              </Text>
              <Text>
                <strong>Created At:</strong>{" "}
                {new Date(location.createdAt).toLocaleString()}
              </Text>
              <Text>
                <strong>Updated At:</strong>{" "}
                {new Date(location.updatedAt).toLocaleString()}
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
