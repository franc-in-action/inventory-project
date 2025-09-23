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
import { fetchProducts } from "../../utils/productsUtils.js";
import { createPurchase } from "../../utils/purchasesUtils.js";

export default function PurchaseDetails({
  purchase,
  isOpen,
  onClose,
  onSaved,
  vendors,
  locations,
}) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [saving, setSaving] = useState(false);
  const [productsMap, setProductsMap] = useState({}); // map productId => productName

  useEffect(() => {
    if (!isOpen) return;

    // Set initial values
    setItems(purchase?.items || []);
    setVendorId(purchase?.vendorId || "");
    setLocationId(purchase?.locationId || "");

    // Load products
    const loadProducts = async () => {
      try {
        const result = await fetchProducts();
        let productsArray = [];

        // Normalize results: Electron returns rows directly, Web returns { products }
        if (Array.isArray(result)) {
          productsArray = result; // Electron mode
        } else if (result.products && Array.isArray(result.products)) {
          productsArray = result.products; // Web mode
        }

        const map = {};
        productsArray.forEach((p) => (map[p.id] = p.name));
        setProductsMap(map);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    loadProducts();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Purchase Details - {purchase?.purchaseUuid}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Vendor & Location */}
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

            {/* Purchase Order Table */}
            <Text fontWeight="bold">Items</Text>
            <Table variant="simple" size="sm">
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
                        size="sm"
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
                        size="sm"
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
                  <Td colSpan={3} fontWeight="bold" textAlign="right">
                    Total
                  </Td>
                  <Td fontWeight="bold">{totalAmount.toLocaleString()}</Td>
                </Tr>
              </Tbody>
            </Table>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={saving}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
