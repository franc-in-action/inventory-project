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
  ButtonGroup,
  Spinner,
  Text,
} from "@chakra-ui/react";
import CloseBtn from "../../components/CloseBtn.jsx"; // import your custom CloseBtn

import { usePayments } from "../payments/contexts/PaymentsContext.jsx";
import { useCustomers } from "../customers/contexts/CustomersContext.jsx";

export default function AdjustmentForm({
  adjustmentId,
  isOpen,
  onClose,
  onSaved,
}) {
  const toast = useToast();
  const { customers } = useCustomers();
  const { adjustments, createAdjustment, getAdjustment } = usePayments();

  const [adjustment, setAdjustment] = useState({
    customerId: "",
    amount: 0,
    method: "manual",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    (async () => {
      try {
        if (adjustmentId) {
          const data = await getAdjustment(adjustmentId);
          setAdjustment({
            customerId: data.customerId || "",
            amount: data.amount || 0,
            method: data.method || "manual",
            description: data.description || "",
          });
        } else {
          setAdjustment({
            customerId: "",
            amount: 0,
            method: "manual",
            description: "",
          });
        }
      } catch (err) {
        toast({ status: "error", description: "Failed to load adjustment" });
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, adjustmentId, getAdjustment, toast]);

  const handleChange = (e) =>
    setAdjustment((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...adjustment, amount: parseFloat(adjustment.amount) };
      if (!payload.amount || payload.amount <= 0)
        return toast({
          status: "error",
          description: "Amount must be positive",
        });

      await createAdjustment(payload);
      toast({ status: "success", description: "Adjustment created" });
      onSaved();
      onClose();
    } catch (err) {
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
          {adjustmentId ? "Edit Adjustment" : "Add Adjustment"}
        </ModalHeader>
        <CloseBtn onClick={onClose} />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack>
              <FormControl isRequired>
                <FormLabel>Customer</FormLabel>
                <select
                  name="customerId"
                  value={adjustment.customerId}
                  onChange={handleChange}
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input
                  type="number"
                  name="amount"
                  value={adjustment.amount}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Method</FormLabel>
                <select
                  name="method"
                  value={adjustment.method}
                  onChange={handleChange}
                >
                  <option value="manual">Manual</option>
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                </select>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={adjustment.description}
                  onChange={handleChange}
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saving}
              colorScheme="teal"
              size="sm"
            >
              {adjustmentId ? "Update" : "Create"}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
