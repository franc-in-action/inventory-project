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

import { useVendors } from "../vendors/contexts/VendorsContext.jsx";
import { usePurchases } from "./contexts/PurchasesContext.jsx";

export default function PurchaseForm({
  isOpen,
  onClose,
  onSaved,
  locations = [],
  purchase,
}) {
  const toast = useToast();
  const { vendors, fetchProductsForVendor } = useVendors();
  const { addPurchase } = usePurchases();

  // ---- State ----
  const [vendorId, setVendorId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [items, setItems] = useState([{ productId: "", qty: 1, price: 0 }]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [saving, setSaving] = useState(false);

  const isReadOnly = purchase?.received ?? false;

  // ---- Initialize form fields when modal opens or purchase changes ----
  useEffect(() => {
    if (!isOpen) return;

    if (purchase) {
      setVendorId(purchase.vendorId || "");
      setLocationId(purchase.locationId || "");
      setItems(purchase.items?.map((i) => ({ ...i })) || []);
    } else {
      resetForm();
    }
  }, [purchase, isOpen]);

  // ---- Load vendor-specific products whenever vendor changes ----
  useEffect(() => {
    if (!vendorId) {
      setAvailableProducts([]);
      return;
    }

    fetchProductsForVendor(vendorId)
      .then(setAvailableProducts)
      .catch(() => setAvailableProducts([]));
  }, [vendorId, fetchProductsForVendor]);

  // ---- Helpers ----
  const resetForm = () => {
    setVendorId("");
    setLocationId("");
    setItems([{ productId: "", qty: 1, price: 0 }]);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      // Auto-fill price when selecting a product
      if (field === "productId") {
        const selected = availableProducts.find((p) => p.id === Number(value));
        if (selected) updated[index].price = selected.purchasePrice || 0;
      }

      return updated;
    });
  };

  const addItem = () =>
    setItems((prev) => [...prev, { productId: "", qty: 1, price: 0 }]);

  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  // ---- Submit handler ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!vendorId || !locationId || items.length === 0) {
      toast({ status: "error", description: "Fill all required fields." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        vendorId: Number(vendorId),
        locationId: Number(locationId),
        items,
      };

      // keep same purchase number if editing
      if (purchase) payload.purchaseNumber = purchase.purchaseNumber;

      await addPurchase(payload);

      toast({
        status: "success",
        description: purchase ? "Purchase updated" : "Purchase created",
      });

      onSaved();
      onClose();
    } catch (err) {
      toast({ status: "error", description: err.message || "Error saving" });
    } finally {
      setSaving(false);
    }
  };

  // ---- Render ----
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>
          {purchase
            ? `Edit Purchase – ${purchase.purchaseNumber}`
            : "Create Purchase"}
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          {isReadOnly && (
            <Text color="red.500" fontWeight="bold" mb={2}>
              This purchase has already been received and cannot be edited.
            </Text>
          )}

          <VStack spacing={4} align="stretch">
            {/* Vendor */}
            <Select
              placeholder="Select Vendor"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              isDisabled={isReadOnly}
              isRequired
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>

            {/* Location */}
            <Select
              placeholder="Select Location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              isDisabled={isReadOnly}
              isRequired
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>

            {/* Items */}
            <Text fontWeight="medium">Items</Text>

            <VStack spacing={2} align="stretch">
              {items.map((item, idx) => (
                <HStack key={idx}>
                  <Select
                    placeholder="Select Product"
                    value={item.productId}
                    onChange={(e) =>
                      updateItem(idx, "productId", e.target.value)
                    }
                    isDisabled={isReadOnly}
                    isRequired
                  >
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Price: ${p.purchasePrice ?? 0}
                      </option>
                    ))}
                  </Select>

                  <NumberInput
                    min={1}
                    value={item.qty}
                    onChange={(val) => updateItem(idx, "qty", Number(val))}
                    isDisabled={isReadOnly}
                  >
                    <NumberInputField placeholder="Qty" />
                  </NumberInput>

                  <NumberInput
                    min={0}
                    value={item.price}
                    onChange={(val) => updateItem(idx, "price", Number(val))}
                    isDisabled={isReadOnly}
                  >
                    <NumberInputField placeholder="Price" />
                  </NumberInput>

                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => removeItem(idx)}
                    isDisabled={isReadOnly}
                    aria-label="Remove item"
                  />
                </HStack>
              ))}

              <Button
                leftIcon={<AddIcon />}
                onClick={addItem}
                isDisabled={isReadOnly}
              >
                Add Item
              </Button>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={saving}
              isDisabled={isReadOnly}
            >
              {purchase
                ? `Update Purchase – ${purchase.purchaseNumber}`
                : "Create Purchase"}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
