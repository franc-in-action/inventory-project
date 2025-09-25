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
  ButtonGroup,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { fetchLocations } from "../locations/locationsApi.js";
import { fetchStockForProducts } from "../stock/stockApi.js";
import { createPurchase, fetchProductsForVendor } from "./purchaseApi.js";
import { useProducts } from "../products/contexts/ProductsContext.jsx";

export default function PurchaseForm({
  isOpen,
  onClose,
  onSaved,
  vendors,
  locations: initialLocations = [],
  purchase,
}) {
  const toast = useToast();
  const { products } = useProducts();
  const [locationId, setLocationId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [items, setItems] = useState([{ productId: "", qty: 1, price: 0 }]);
  // const [locations, setLocations] = useState(initialLocations);
  const [stockByProduct, setStockByProduct] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [saving, setSaving] = useState(false);

  // Initialize form if editing
  useEffect(() => {
    if (!isOpen) return;
    if (purchase) {
      setVendorId(purchase.vendorId || "");
      setLocationId(purchase.locationId || "");
      setItems(purchase.items?.map((i) => ({ ...i })) || []);
    } else {
      setVendorId("");
      setLocationId("");
      setItems([{ productId: "", qty: 1, price: 0 }]);
    }
  }, [purchase, isOpen]);

  // ✅ Load products for selected vendor from backend
  useEffect(() => {
    if (!vendorId) {
      setFilteredProducts([]);
      return;
    }
    fetchProductsForVendor(vendorId)
      .then(setFilteredProducts)
      .catch(() => setFilteredProducts([]));
  }, [vendorId]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      if (field === "productId") {
        const product = filteredProducts.find((p) => p.id === Number(value));
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
      if (purchase) payload.purchaseUuid = purchase.purchaseUuid;
      await createPurchase(payload);
      toast({
        status: "success",
        description: purchase ? "Purchase updated" : "Purchase created",
      });
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
          {purchase
            ? `Edit Purchase - ${purchase.purchaseUuid}`
            : "Create Purchase"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
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
              {initialLocations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>

            <Text>Items</Text>
            <VStack spacing={2} align="stretch">
              {items.map((item, idx) => (
                <HStack key={idx}>
                  <Select
                    placeholder="Select Product"
                    value={item.productId}
                    onChange={(e) =>
                      handleItemChange(idx, "productId", e.target.value)
                    }
                    isRequired
                  >
                    {filteredProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - Price: ${p.purchasePrice ?? 0}
                      </option>
                    ))}
                  </Select>

                  <NumberInput
                    min={1}
                    value={item.qty}
                    onChange={(val) =>
                      handleItemChange(idx, "qty", Number(val))
                    }
                  >
                    <NumberInputField placeholder="Qty" />
                  </NumberInput>

                  <NumberInput
                    min={0}
                    value={item.price}
                    onChange={(val) =>
                      handleItemChange(idx, "price", Number(val))
                    }
                  >
                    <NumberInputField placeholder="Price" />
                  </NumberInput>

                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => removeItemRow(idx)}
                  />
                </HStack>
              ))}
              <Button leftIcon={<AddIcon />} onClick={addItemRow}>
                Add Item
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={saving} colorScheme="blue">
              {purchase
                ? `Update Purchase - ${purchase.purchaseUuid}`
                : "Create Purchase"}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
