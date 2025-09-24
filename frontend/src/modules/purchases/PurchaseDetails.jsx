import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  useToast,
} from "@chakra-ui/react";
import { createPurchase } from "./purchaseApi.js";
import { useProducts } from "../products/contexts/ProductsContext.jsx";

export default function PurchaseDetails({
  purchase,
  isOpen,
  onClose,
  onSaved,
  vendors,
  locations,
}) {
  const toast = useToast();
  const { productsMap } = useProducts();
  const [items, setItems] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setItems(purchase?.items || []);
    setVendorId(purchase?.vendorId || "");
    setLocationId(purchase?.locationId || "");
  }, [purchase, isOpen]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        vendorId,
        locationId,
        items,
        purchaseUuid: purchase.purchaseUuid,
      };
      await createPurchase(payload);
      toast({ status: "success", description: "Purchase updated" });
      onSaved();
      onClose();
    } catch (err) {
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Purchase Details - {purchase?.purchaseUuid}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
            <Select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              isRequired
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>

            <Select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              isRequired
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>

            <Text>Items</Text>
            <Table>
              <Thead>
                <Tr>
                  <Th>Product</Th>
                  <Th>Qty</Th>
                  <Th>Price</Th>
                  <Th>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item, idx) => (
                  <Tr key={idx}>
                    <Td>{productsMap[item.productId] || item.productId}</Td>
                    <Td>
                      <NumberInput
                        min={1}
                        value={item.qty}
                        onChange={(val) =>
                          handleItemChange(idx, "qty", Number(val))
                        }
                      >
                        <NumberInputField />
                      </NumberInput>
                    </Td>
                    <Td>
                      <NumberInput
                        min={0}
                        value={item.price}
                        onChange={(val) =>
                          handleItemChange(idx, "price", Number(val))
                        }
                      >
                        <NumberInputField />
                      </NumberInput>
                    </Td>
                    <Td>{(item.qty * item.price).toLocaleString()}</Td>
                  </Tr>
                ))}
                <Tr>
                  <Td colSpan={3}>Total</Td>
                  <Td>{totalAmount.toLocaleString()}</Td>
                </Tr>
              </Tbody>
            </Table>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={handleSubmit} isLoading={saving}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
