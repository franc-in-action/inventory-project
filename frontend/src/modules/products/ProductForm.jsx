// src/components/modals/ProductForm.jsx
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
  Textarea,
  Spinner,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import ComboBox from "../../components/ComboBox.jsx";
import {
  fetchProductById,
  createProduct,
  updateProduct,
} from "./productsApi.js";
import { fetchCategories, createCategory } from "./categoriesApi.js";
import { fetchLocations } from "../locations/locationsApi.js";

export default function ProductForm({ productId, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const [product, setProduct] = useState({
    name: "",
    sku: "",
    price: 0,
    quantity: 0,
    description: "",
    categoryId: "",
    locationId: "",
  });
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load categories and locations when modal opens
  useEffect(() => {
    if (!isOpen) return;
    console.log(
      "[ProductForm] Modal opened. Loading categories and locations..."
    );
    (async () => {
      try {
        const [cats, locs] = await Promise.all([
          fetchCategories(),
          fetchLocations(),
        ]);
        console.log("[ProductForm] Categories loaded:", cats);
        console.log("[ProductForm] Locations loaded:", locs);
        setCategories(cats || []);
        setLocations(locs || []);
      } catch (err) {
        console.error(
          "[ProductForm] Failed to load categories or locations:",
          err
        );
        toast({ status: "error", description: "Failed to load data." });
      }
    })();
  }, [isOpen, toast]);

  // Load product details when editing
  useEffect(() => {
    if (!isOpen) return;
    if (!productId) {
      console.log("[ProductForm] Creating new product, resetting form...");
      setProduct({
        name: "",
        sku: "",
        price: 0,
        quantity: 0,
        description: "",
        categoryId: "",
        locationId: "",
      });
      return;
    }
    console.log("[ProductForm] Editing product with ID:", productId);
    setLoading(true);
    (async () => {
      try {
        const data = await fetchProductById(productId);
        console.log("[ProductForm] Product data loaded:", data);
        if (data) setProduct(data);
      } catch (err) {
        console.error("[ProductForm] Failed to load product:", err);
        toast({ status: "error", description: "Failed to load product." });
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, isOpen, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("[ProductForm] Field changed:", name, value);
    setProduct((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...product,
      price: Number(product.price),
      quantity: Number(product.quantity),
    };
    console.log("[ProductForm] Submitting product:", payload);
    try {
      if (productId) {
        console.log("[ProductForm] Updating existing product...");
        await updateProduct(productId, payload);
      } else {
        console.log("[ProductForm] Creating new product...");
        await createProduct(payload);
      }
      toast({
        status: "success",
        description: `Product ${productId ? "updated" : "created"}`,
      });
      console.log("[ProductForm] Product saved successfully.");
      onSaved();
      onClose();
    } catch (err) {
      console.error("[ProductForm] Error saving product:", err);
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>
          {productId ? "Edit Product" : "Create Product"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner size="xl" margin="auto" />
          ) : (
            <VStack spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  size="sm"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>SKU</FormLabel>
                <Input
                  size="sm"
                  name="sku"
                  value={product.sku}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Price</FormLabel>
                <Input
                  size="sm"
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Quantity</FormLabel>
                <Input
                  size="sm"
                  type="number"
                  name="quantity"
                  value={product.quantity}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  size="sm"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <ComboBox
                  items={categories}
                  selectedItemId={product.categoryId}
                  placeholder="Select or add category"
                  createNewItem={async (name) => {
                    console.log("[ProductForm] createNewItem called:", name);
                    const cat = await createCategory(name);
                    console.log("[ProductForm] Category created:", cat);
                    return cat;
                  }}
                  onSelect={(item) => {
                    console.log("[ProductForm] ComboBox onSelect:", item);
                    setCategories((prev) => {
                      if (!prev.some((c) => c.id === item.id))
                        return [...prev, item];
                      return prev;
                    });
                    setProduct((p) => ({ ...p, categoryId: item.id }));
                    toast({
                      status: "success",
                      description: `Category "${item.name}" selected/created`,
                    });
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <ComboBox
                  items={locations}
                  selectedItemId={product.locationId}
                  placeholder="Select location"
                  onSelect={(item) => {
                    console.log("[ProductForm] Location selected:", item);
                    setProduct((p) => ({ ...p, locationId: item.id }));
                  }}
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={saving}>
            {productId ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
