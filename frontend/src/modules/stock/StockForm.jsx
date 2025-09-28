import { useState } from "react";
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
  NumberInput,
  NumberInputField,
  ButtonGroup,
} from "@chakra-ui/react";
import CloseBtn from "../../components/CloseBtn.jsx"; // import your custom CloseBtn

import { apiFetch } from "../../utils/commonApi.js";
import { v4 as uuidv4 } from "uuid";

export default function StockForm({
  productId,
  locationId,
  isOpen,
  onClose,
  onSaved,
}) {
  const toast = useToast();
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiFetch("/stock/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movementUuid: uuidv4(),
          productId,
          locationId,
          delta: Number(delta),
          reason,
        }),
      });
      toast({ status: "success", description: "Stock updated" });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast({ status: "error", description: "Failed to update stock" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Update Stock</ModalHeader>
        <CloseBtn onClick={onClose} />
        <ModalBody>
          <VStack>
            <FormControl isRequired>
              <FormLabel>Quantity Change (positive or negative)</FormLabel>
              <NumberInput value={delta} onChange={(v) => setDelta(v)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Reason</FormLabel>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" type="submit" isLoading={saving}>
              Save
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
