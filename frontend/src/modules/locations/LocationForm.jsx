import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import {
  fetchLocationById,
  createLocation,
  updateLocation,
} from "./locationsApi.js";

export default function LocationForm({ locationId, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const [location, setLocation] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!locationId) {
      setLocation({ name: "", address: "" });
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const data = await fetchLocationById(locationId);
        if (data) setLocation(data);
      } catch (err) {
        console.error("Failed to load location:", err);
        toast({ status: "error", description: "Failed to load location" });
      } finally {
        setLoading(false);
      }
    })();
  }, [locationId, isOpen, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (locationId) {
        await updateLocation(locationId, location);
        toast({ status: "success", description: "Location updated" });
      } else {
        await createLocation(location);
        toast({ status: "success", description: "Location created" });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving location:", err);
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>
          {locationId ? "Edit Location" : "Add Location"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={location.name}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  value={location.address}
                  onChange={handleChange}
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={saving}>
            {locationId ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
