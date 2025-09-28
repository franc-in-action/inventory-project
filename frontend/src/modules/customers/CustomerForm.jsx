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
} from "@chakra-ui/react";
import { useCustomers } from "./contexts/CustomersContext.jsx";
import { CloseBtn } from "../../components/Xp.jsx"; // import your custom CloseBtn

export default function CustomerForm({ customerId, isOpen, onClose }) {
  const toast = useToast();
  const { fetchCustomerById, addCustomer, editCustomer } = useCustomers();

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
        const data = await fetchCustomerById(customerId);
        if (data) setCustomer(data);
      } catch (err) {
        console.error("Failed to load customer:", err);
        toast({ status: "error", description: "Failed to load customer" });
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId, isOpen, toast, fetchCustomerById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (customerId) {
        await editCustomer(customerId, customer);
        toast({ status: "success", description: "Customer updated" });
      } else {
        await addCustomer(customer);
        toast({ status: "success", description: "Customer created" });
      }
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
      <ModalContent as="form" onSubmit={handleSubmit} position="relative">
        <ModalHeader>
          {customerId ? "Edit Customer" : "Add Customer"}
        </ModalHeader>

        {/* Custom CloseBtn positioned absolutely */}
        <CloseBtn onClick={onClose} />

        <ModalBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack spacing={4}>
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
