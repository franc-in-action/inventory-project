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
  HStack,
  Select,
  NumberInput,
  NumberInputField,
  Text,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { fetchLocations } from "../locations/locationsApi.js";
import { fetchStockForProducts } from "../stock/stockApi.js";
import { createPurchase } from "./purchaseApi.js";
import { useProducts } from "../products/contexts/ProductsContext.jsx"; // ✅ context

export default function PurchaseForm({ isOpen, onClose, onSaved, vendors }) {
  const toast = useToast();
  const { products } = useProducts(); // ✅ get products from context
  const [locationId, setLocationId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [items, setItems] = useState([{ productId: "", qty: 1, price: 0 }]);
  const [locations, setLocations] = useState([]);
  const [stockByProduct, setStockByProduct] = useState({});
  const [saving, setSaving] = useState(false);

  // Load locations
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const locs = await fetchLocations();
        setLocations(locs || []);
      } catch (err) {
        toast({ status: "error", description: "Failed to load locations" });
      }
    })();
  }, [isOpen, toast]);

  // Fetch stock when location or products change
  useEffect(() => {
    if (!isOpen || !products.length) return;
    (async () => {
      try {
        if (locationId) {
          const stock = await fetchStockForProducts(
            products.map((p) => p.id),
            locationId
          );
          setStockByProduct(stock);
        } else {
          setStockByProduct({});
        }
      } catch (err) {
        console.error("Failed to fetch stock:", err);
      }
    })();
  }, [products, locationId, isOpen]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index][field] = value;

      // auto-fill purchase price if product changes
      if (field === "productId") {
        const product = products.find((p) => p.id === value);
        if (product) copy[index].price = product.purchasePrice || 0;
      }

      return copy;
    });
  };

  const addItemRow = () =>
    setItems((prev) => [...prev, { productId: "", qty: 1, price: 0 }]);
  const removeItemRow = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId || !locationId || items.length === 0) {
      toast({ status: "error", description: "Fill all required fields" });
      return;
    }
    setSaving(true);
    try {
      const payload = { vendorId, locationId, items };
      await createPurchase(payload);
      toast({ status: "success", description: "Purchase created" });
      onSaved();
      onClose();
    } catch (err) {
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create Purchase</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Select
              placeholder="Select Vendor"
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
              placeholder="Select Location"
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

            <Text fontWeight="bold">Items</Text>
            <VStack spacing={2} align="stretch">
              {items.map((item, idx) => (
                <HStack key={idx} spacing={2}>
                  <Select
                    placeholder="Select Product"
                    value={item.productId}
                    onChange={(e) =>
                      handleItemChange(idx, "productId", e.target.value)
                    }
                    isRequired
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku}) - Stock:{" "}
                        {stockByProduct[p.id] ?? 0} - Purchase: $
                        {p.purchasePrice ?? 0}
                      </option>
                    ))}
                  </Select>

                  <NumberInput
                    size="sm"
                    min={1}
                    value={item.qty}
                    onChange={(val) =>
                      handleItemChange(idx, "qty", Number(val))
                    }
                  >
                    <NumberInputField placeholder="Qty" />
                  </NumberInput>

                  <NumberInput
                    size="sm"
                    min={0}
                    value={item.price}
                    onChange={(val) =>
                      handleItemChange(idx, "price", Number(val))
                    }
                  >
                    <NumberInputField placeholder="Purchase Price" />
                  </NumberInput>

                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => removeItemRow(idx)}
                  />
                </HStack>
              ))}
              <Button leftIcon={<AddIcon />} size="sm" onClick={addItemRow}>
                Add Item
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={saving}>
            Create Purchase
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
