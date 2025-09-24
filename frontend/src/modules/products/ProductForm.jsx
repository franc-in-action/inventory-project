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

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const [cats, locs] = await Promise.all([
          fetchCategories(),
          fetchLocations(),
        ]);
        setCategories(cats || []);
        setLocations(locs || []);
      } catch {
        toast({ status: "error", description: "Failed to load data." });
      }
    })();
  }, [isOpen, toast]);

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
      } catch {
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
      if (productId) {
        await updateProduct(productId, payload);
      } else {
        await createProduct(payload);
      }
      toast({
        status: "success",
        description: `Product ${productId ? "updated" : "created"}`,
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
          {productId ? "Edit Product" : "Create Product"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>SKU</FormLabel>
                <Input name="sku" value={product.sku} onChange={handleChange} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Price</FormLabel>
                <Input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Quantity</FormLabel>
                <Input
                  type="number"
                  name="quantity"
                  value={product.quantity}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={product.description || ""}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <ComboBox
                  items={categories}
                  selectedItemId={product.categoryId}
                  placeholder="Select or add category"
                  createNewItem={createCategory}
                  onSelect={(item) => {
                    setCategories((prev) =>
                      prev.some((c) => c.id === item.id)
                        ? prev
                        : [...prev, item]
                    );
                    setProduct((p) => ({ ...p, categoryId: item.id }));
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <ComboBox
                  items={locations}
                  selectedItemId={product.locationId}
                  placeholder="Select location"
                  onSelect={(item) =>
                    setProduct((p) => ({ ...p, locationId: item.id }))
                  }
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={saving}>
            {productId ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
