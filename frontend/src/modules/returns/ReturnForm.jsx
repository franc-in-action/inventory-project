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
  ButtonGroup,
} from "@chakra-ui/react";
import { useSales } from "../sales/contexts/SalesContext.jsx";

export default function ReturnForm({ returnId, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const { returns, addReturn, getReturnById } = useSales();

  const [returnData, setReturnData] = useState({
    customerId: "",
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    (async () => {
      try {
        if (returnId) {
          const data = getReturnById(returnId);
          setReturnData({
            customerId: data.customerId || "",
            items: data.items || [],
          });
        } else {
          setReturnData({ customerId: "", items: [] });
        }
      } catch (err) {
        toast({ status: "error", description: "Failed to load return" });
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, returnId, getReturnById, toast]);

  const handleChange = (e) =>
    setReturnData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addReturn(returnData);
      toast({ status: "success", description: "Return saved" });
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
        <ModalHeader>{returnId ? "Edit Return" : "New Return"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <VStack>
              <FormControl isRequired>
                <FormLabel>Customer ID</FormLabel>
                <Input
                  name="customerId"
                  value={returnData.customerId}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Items (JSON Array)</FormLabel>
                <Input
                  name="items"
                  value={JSON.stringify(returnData.items)}
                  onChange={(e) =>
                    setReturnData((prev) => ({
                      ...prev,
                      items: JSON.parse(e.target.value || "[]"),
                    }))
                  }
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
              {returnId ? "Update" : "Create"}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
