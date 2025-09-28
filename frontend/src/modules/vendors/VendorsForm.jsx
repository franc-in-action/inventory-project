import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  ButtonGroup,
} from "@chakra-ui/react";
import CloseBtn from "../../components/CloseBtn.jsx"; // import your custom CloseBtn

import { useVendors } from "./contexts/VendorsContext.jsx";

export default function VendorForm({ vendorId, isOpen, onClose }) {
  const toast = useToast();
  const { getVendorById, addVendor, editVendor } = useVendors();
  const [vendor, setVendor] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!vendorId) {
      setVendor({ name: "", email: "", phone: "" });
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const data = await getVendorById(vendorId);
        if (data) setVendor(data);
      } catch (err) {
        console.error("Failed to load vendor:", err);
        toast({ status: "error", description: "Failed to load vendor" });
      } finally {
        setLoading(false);
      }
    })();
  }, [vendorId, isOpen, getVendorById, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (vendorId) {
        await editVendor(vendorId, vendor);
        toast({ status: "success", description: "Vendor updated" });
      } else {
        await addVendor(vendor);
        toast({ status: "success", description: "Vendor created" });
      }
      onClose();
    } catch (err) {
      console.error("Error saving vendor:", err);
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>{vendorId ? "Edit Vendor" : "Add Vendor"}</ModalHeader>
        <CloseBtn onClick={onClose} />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={vendor.name}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  value={vendor.email}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  value={vendor.phone}
                  onChange={handleChange}
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" type="submit" isLoading={saving}>
              {vendorId ? "Update" : "Create"}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
