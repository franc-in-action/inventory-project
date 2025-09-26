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
  Select,
  Spinner,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import ComboBox from "../../components/ComboBox.jsx";
import { useVendors } from "../vendors/contexts/VendorsContext.jsx";
import { useLocations } from "../locations/contexts/LocationsContext.jsx";
import { useProducts } from "./contexts/ProductsContext.jsx";
import { useCategories } from "../categories/contexts/CategoriesContext.jsx";

export default function ProductForm({ productId, isOpen, onClose, onSaved }) {
  const toast = useToast();

  const { vendors, loading: vendorsLoading, reloadVendors } = useVendors();
  const { locations, loading: locationsLoading } = useLocations();
  const { getProductById, addProduct, updateProductById } = useProducts();
  const { addCategory } = useCategories(); // Use context directly

  const [product, setProduct] = useState({
    name: "",
    sku: "",
    price: 0,
    quantity: 0,
    description: "",
    categoryId: "",
    locationId: "",
    vendorIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load vendors when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (!vendors.length) reloadVendors().catch(() => {});
  }, [isOpen, vendors.length, reloadVendors]);

  // Load product for editing
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
        vendorIds: [],
      });
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const data = await getProductById(productId);
        if (data) {
          setProduct({
            ...data,
            vendorIds:
              data.vendorIds ||
              data.productVendors?.map((pv) => pv.vendor.id) ||
              [],
          });
        }
      } catch {
        toast({ status: "error", description: "Failed to load product." });
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, isOpen, getProductById, toast]);

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
      vendorIds: product.vendorIds || [],
    };
    try {
      if (productId) {
        await updateProductById(productId, payload);
      } else {
        await addProduct(payload);
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
          {loading || locationsLoading ? (
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
                  selectedItemId={product.categoryId}
                  placeholder="Select or add category"
                  onSelect={(item) =>
                    setProduct((p) => ({ ...p, categoryId: item.id }))
                  }
                  createNewItem={addCategory}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Select
                  placeholder="Select location"
                  value={product.locationId}
                  onChange={(e) =>
                    setProduct((p) => ({ ...p, locationId: e.target.value }))
                  }
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Vendors</FormLabel>
                {vendorsLoading ? (
                  <Spinner />
                ) : (
                  <Select
                    multiple
                    value={product.vendorIds || []}
                    onChange={(e) =>
                      setProduct((p) => ({
                        ...p,
                        vendorIds: Array.from(
                          e.target.selectedOptions,
                          (o) => o.value
                        ),
                      }))
                    }
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </Select>
                )}
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
