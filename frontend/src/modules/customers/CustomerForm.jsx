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
  FormControl,
  FormLabel,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import {
  getCustomerById,
  createCustomer,
  updateCustomer,
} from "./customersApi.js";

export default function CustomerForm({ customerId, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!customerId) {
      setCustomer({ name: "", email: "", phone: "" });
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const data = await getCustomerById(customerId);
        if (data) setCustomer(data);
      } catch (err) {
        console.error("Failed to load customer:", err);
        toast({ status: "error", description: "Failed to load customer" });
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId, isOpen, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (customerId) {
        await updateCustomer(customerId, customer);
        toast({ status: "success", description: "Customer updated" });
      } else {
        await createCustomer(customer);
        toast({ status: "success", description: "Customer created" });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving customer:", err);
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
          {customerId ? "Edit Customer" : "Add Customer"}
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
                  value={customer.name}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  value={customer.email}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  value={customer.phone}
                  onChange={handleChange}
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={saving}>
            {customerId ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
