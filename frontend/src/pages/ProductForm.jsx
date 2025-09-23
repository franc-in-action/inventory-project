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
  Select,
  Box,
  useToast,
} from "@chakra-ui/react";
import { useCombobox } from "downshift";
import {
  fetchProductById,
  createProduct,
  updateProduct,
} from "../utils/productsUtils.js";
import { fetchCategories } from "../utils/categoriesUtils.js";
import { fetchLocations } from "../utils/locationsUtils.js";

/**
 * ---- ComboBox ----
 * Reusable searchable combobox with inline "create new" option.
 */
function ComboBox({ items, selectedItemId, onSelect }) {
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    inputValue,
  } = useCombobox({
    items,
    itemToString: (item) => (item ? item.name : ""),
    selectedItem: items.find((c) => c.id === selectedItemId) || null,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) onSelect(selectedItem);
    },
  });

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const canCreate =
    inputValue &&
    !filtered.some(
      (item) => item.name.toLowerCase() === inputValue.toLowerCase()
    );

  return (
    <Box position="relative">
      <Input
        size="sm"
        placeholder="Type or create category"
        {...getInputProps()}
      />
      <Box
        {...getMenuProps()}
        borderWidth={isOpen ? "1px" : 0}
        borderRadius="md"
        mt={1}
        bg="white"
        zIndex={10}
        position="absolute"
        w="full"
        maxH="200px"
        overflowY="auto"
      >
        {isOpen && (filtered.length > 0 || canCreate) && (
          <>
            {filtered.map((item, index) => (
              <Box
                key={item.id}
                px={3}
                py={2}
                bg={highlightedIndex === index ? "gray.100" : "white"}
                cursor="pointer"
                {...getItemProps({ item, index })}
              >
                {item.name}
              </Box>
            ))}
            {canCreate && (
              <Box
                px={3}
                py={2}
                bg={highlightedIndex === filtered.length ? "gray.100" : "white"}
                cursor="pointer"
                fontStyle="italic"
                color="blue.500"
                {...getItemProps({
                  item: inputValue,
                  index: filtered.length,
                  onClick: () => onSelect(inputValue),
                })}
              >
                + Create “{inputValue}”
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

/**
 * ---- ProductForm ----
 */
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

  // Fetch categories & locations when modal opens
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const [cats, locs] = await Promise.all([
          fetchCategories(),
          fetchLocations(),
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setLocations(Array.isArray(locs) ? locs : []);
      } catch (err) {
        console.error(err);
        toast({ status: "error", description: "Failed to load data." });
      }
    })();
  }, [isOpen, toast]);

  // Load product details when editing
  useEffect(() => {
    if (!isOpen) return;
    if (!productId) {
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
    setLoading(true);
    (async () => {
      try {
        const data = await fetchProductById(productId);
        if (data) setProduct(data);
      } catch (err) {
        console.error(err);
        toast({ status: "error", description: "Failed to load product." });
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, isOpen, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    try {
      if (productId) await updateProduct(productId, payload);
      else await createProduct(payload);
      onSaved();
    } catch (err) {
      console.error(err);
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit} mx={{ base: 4, md: 0 }}>
        <ModalHeader>
          {productId ? "Edit Product" : "Create Product"}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Spinner />
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
                  value={product.description || ""}
                  onChange={handleChange}
                />
              </FormControl>

              {/* ✅ Searchable + creatable Category select */}
              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <ComboBox
                  items={categories}
                  selectedItemId={product.categoryId}
                  onSelect={async (itemOrName) => {
                    // User typed a new category name
                    if (typeof itemOrName === "string") {
                      try {
                        const newCat = await createCategory(itemOrName);
                        setCategories((prev) => [...prev, newCat]);
                        setProduct((p) => ({ ...p, categoryId: newCat.id }));
                        toast({
                          status: "success",
                          description: `Category "${newCat.name}" created`,
                        });
                      } catch (err) {
                        console.error(err);
                        toast({ status: "error", description: err.message });
                      }
                    } else {
                      setProduct((p) => ({ ...p, categoryId: itemOrName.id }));
                    }
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Select
                  size="sm"
                  placeholder="Select location"
                  name="locationId"
                  value={product.locationId || ""}
                  onChange={handleChange}
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
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
