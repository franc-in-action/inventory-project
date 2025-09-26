// src/modules/locations/LocationDetails.jsx
import { useState, useEffect } from "react";
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
import { useLocations } from "./contexts/LocationsContext.jsx";

export default function LocationDetails({ locationId, isOpen, onClose }) {
  const { locations, loading: locationsLoading } = useLocations();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!isOpen || !locationId) return;

    // Find the location from the context
    const loc = locations.find((l) => l.id === locationId);
    setLocation(loc || null);
  }, [locationId, isOpen, locations]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Location Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {locationsLoading ? (
            <Spinner />
          ) : location ? (
            <VStack>
              <Text>
                <strong>Name:</strong> {location.name}
              </Text>
              <Text>
                <strong>Address:</strong> {location.address || "N/A"}
              </Text>
              <Text>
                <strong>Created At:</strong>{" "}
                {location.createdAt
                  ? new Date(location.createdAt).toLocaleString()
                  : "N/A"}
              </Text>
              <Text>
                <strong>Updated At:</strong>{" "}
                {location.updatedAt
                  ? new Date(location.updatedAt).toLocaleString()
                  : "N/A"}
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
