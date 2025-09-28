import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
import CloseBtn from "../../components/CloseBtn.jsx"; // import your custom CloseBtn

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
  const { addPurchase, updatePurchase } = usePurchases();

  const [vendorId, setVendorId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [items, setItems] = useState([{ productId: "", qty: 1, price: 0 }]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [saving, setSaving] = useState(false);

  const isReadOnly = purchase?.received ?? false;

  // Initialize form fields
  useEffect(() => {
    if (!isOpen) return;

    if (purchase) {
      setVendorId(purchase.vendorId || "");
      setLocationId(purchase.locationId || "");
      setItems(
        purchase.items?.length
          ? purchase.items.map((i) => ({
              id: i.id, // ✅ include the existing item ID
              productId: i.productId,
              qty: i.qty,
              price: i.price,
            }))
          : [{ productId: "", qty: 1, price: 0 }]
      );
    } else {
      resetForm();
    }
  }, [purchase, isOpen]);

  // Load vendor-specific products
  useEffect(() => {
    if (!vendorId) {
      setAvailableProducts([]);
      return;
    }

    fetchProductsForVendor(vendorId)
      .then(setAvailableProducts)
      .catch(() => setAvailableProducts([]));
  }, [vendorId, fetchProductsForVendor]);

  // Auto-fill prices when products are loaded
  useEffect(() => {
    setItems((prev) =>
      prev.map((item) => {
        if (!item.price && item.productId) {
          const selected = availableProducts.find(
            (p) => p.id === item.productId
          );
          if (selected) return { ...item, price: selected.purchasePrice || 0 };
        }
        return item;
      })
    );
  }, [availableProducts]);

  const resetForm = () => {
    setVendorId("");
    setLocationId("");
    setItems([{ productId: "", qty: 1, price: 0 }]);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      // Only fill price if it’s empty
      if (field === "productId" && !updated[index].price) {
        const selected = availableProducts.find((p) => p.id === value);
        if (selected) updated[index].price = selected.purchasePrice || 0;
      }

      return updated;
    });
  };

  const addItem = () =>
    setItems((prev) => [...prev, { productId: "", qty: 1, price: 0 }]);

  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  // Validation: no zeros or negative values
  const isFormValid = useMemo(() => {
    if (!vendorId || !locationId || items.length === 0) return false;

    for (const item of items) {
      if (!item.productId) return false;
      if (Number(item.qty) <= 0) return false;
      if (Number(item.price) <= 0) return false;
    }

    return true;
  }, [vendorId, locationId, items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly || !isFormValid) return;

    const payload = {
      vendorId,
      locationId,
      items: items.map((i) => ({
        productId: i.productId,
        qty: Number(i.qty),
        price: Number(i.price),
      })),
    };

    setSaving(true);
    try {
      if (purchase) {
        await updatePurchase(purchase.id, payload);
        toast({
          status: "success",
          description: `Purchase ${purchase.purchaseUuid} updated successfully.`,
        });
      } else {
        await addPurchase(payload);
        toast({
          status: "success",
          description: `Purchase ${purchase.purchaseUuid} created successfully.`,
        });
      }

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("[PurchaseForm] Save error:", err);
      toast({
        status: "error",
        description: err.message || "Failed to save purchase.",
      });
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
            ? `Edit Purchase – ${purchase.purchaseUuid}`
            : "Create Purchase"}
        </ModalHeader>

        <CloseBtn onClick={onClose} />

        <ModalBody>
          {isReadOnly && (
            <Text>
              This purchase has already been received and cannot be edited.
            </Text>
          )}

          <VStack>
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

            <Text fontWeight="medium">Items</Text>
            <VStack align="stretch">
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
              isDisabled={isReadOnly || !isFormValid}
            >
              {purchase
                ? `Update Purchase – ${purchase.purchaseUuid}`
                : "Create Purchase"}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
