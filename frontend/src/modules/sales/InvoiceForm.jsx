import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Divider,
  NumberInput,
  NumberInputField,
  Select,
  IconButton,
  Switch,
  FormControl,
  FormLabel,
  ButtonGroup,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

import ComboBox from "../../components/ComboBox.jsx";
import { useProducts } from "../products/contexts/ProductsContext.jsx";
import { useCustomers } from "../customers/contexts/CustomersContext.jsx";
import { useSales } from "./contexts/SalesContext.jsx";
import { fetchNextSaleNumber } from "./salesApi.js";
import InvoiceDetails from "./InvoiceDetails.jsx";

export default function InvoiceForm({ isOpen, onClose }) {
  const { products, stockMap } = useProducts();
  const { customers, reloadCustomers, fetchCustomerById, createCustomer } =
    useCustomers();
  const { addSale, previewSale, previewSaleData } = useSales();

  const [saleUuid, setSaleUuid] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState({ amount: 0, method: "cash" });
  const [isCashSale, setIsCashSale] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    productId: "",
    qty: 1,
    price: 0,
  });

  // Fetch next invoice number & customers
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setSaleUuid(await fetchNextSaleNumber());
      } catch {
        setSaleUuid("N/A");
      }
      reloadCustomers();
    })();
  }, [isOpen, reloadCustomers]);

  // Load selected customer data
  useEffect(() => {
    if (!selectedCustomer) return setCustomerData(null);
    fetchCustomerById(selectedCustomer.id)
      .then(setCustomerData)
      .catch(() => setCustomerData(null));
  }, [selectedCustomer, fetchCustomerById]);

  // Enriched cart with stock and price info
  const enrichedCart = useMemo(
    () =>
      cart.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          ...item,
          price: item.price || product?.price || 0,
          locationId: product?.locationId || "",
          stockQty: stockMap[product?.id] || 0,
        };
      }),
    [cart, products, stockMap]
  );

  const totalAmount = useMemo(
    () => enrichedCart.reduce((sum, i) => sum + i.qty * i.price, 0),
    [enrichedCart]
  );

  useEffect(() => {
    if (isCashSale) setPayment((prev) => ({ ...prev, amount: totalAmount }));
  }, [isCashSale, totalAmount]);

  const handleAddProduct = () => {
    if (!newProduct.productId || newProduct.qty <= 0) return;
    setCart((prev) => [...prev, newProduct]);
    setNewProduct({ productId: "", qty: 1, price: 0 });
  };

  const handleCartChange = (index, field, value) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const removeCartRow = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Preview Sale
  const handlePreview = () => {
    const saleData = {
      saleUuid,
      customer: selectedCustomer,
      items: enrichedCart,
      payment,
      total: totalAmount,
    };
    previewSale(saleData); // store preview in context
  };

  // Submit Sale
  const handleSubmit = async (status = "complete") => {
    if (!selectedCustomer || enrichedCart.length === 0) {
      return alert("Select customer and add at least one product");
    }

    const locationId = enrichedCart[0].locationId;
    if (enrichedCart.some((i) => i.locationId !== locationId)) {
      return alert("All products must belong to the same location");
    }

    const insufficient = enrichedCart.find((i) => i.qty > i.stockQty);
    if (insufficient) {
      const product = products.find((p) => p.id === insufficient.productId);
      return alert(`Insufficient stock for "${product?.name}"`);
    }

    setLoading(true);
    try {
      await addSale({
        saleUuid,
        locationId,
        customerId: selectedCustomer.id,
        items: enrichedCart.map(({ productId, qty, price }) => ({
          productId,
          qty,
          price,
        })),
        payment,
        total: totalAmount,
        status,
      });

      // Reset form
      setCart([]);
      setSelectedCustomer(null);
      setCustomerData(null);
      setPayment({ amount: 0, method: "cash" });
      setIsCashSale(false);
      setSaleUuid("");
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal size="6xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Invoice #: {saleUuid}</ModalHeader>
          <ModalBody>
            {/* Top Row */}
            <HStack spacing={4} mb={4} align="flex-start">
              {/* Left: Add Product */}
              <VStack align="stretch" spacing={2} flex={2}>
                <Text fontWeight="bold">Add Product</Text>
                <Select
                  placeholder="Select Product"
                  value={newProduct.productId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedProduct = products.find(
                      (p) => p.id === selectedId
                    );
                    setNewProduct((prev) => ({
                      ...prev,
                      productId: selectedId,
                      price: selectedProduct?.price || 0,
                    }));
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {stockMap[p.id] || 0})
                    </option>
                  ))}
                </Select>

                <NumberInput
                  min={1}
                  value={newProduct.qty}
                  onChange={(v) =>
                    setNewProduct((prev) => ({ ...prev, qty: Number(v) }))
                  }
                >
                  <NumberInputField placeholder="Qty" />
                </NumberInput>
                <NumberInput
                  min={0}
                  value={newProduct.price}
                  onChange={(v) =>
                    setNewProduct((prev) => ({ ...prev, price: Number(v) }))
                  }
                >
                  <NumberInputField placeholder="Price" />
                </NumberInput>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                  onClick={handleAddProduct}
                >
                  Add to Cart
                </Button>
              </VStack>

              {/* Center: Customer & Cash Sale */}
              <VStack align="stretch" spacing={2} flex={1}>
                <Text fontWeight="bold">Customer Options</Text>
                <Button
                  onClick={() => alert("Implement New Customer Modal")}
                  colorScheme="blue"
                >
                  New Customer
                </Button>
                <ComboBox
                  items={customers}
                  selectedItemId={selectedCustomer?.id}
                  placeholder="Search Customer"
                  onSelect={setSelectedCustomer}
                  createNewItem={async (name) => {
                    const newCust = await createCustomer({ name });
                    reloadCustomers();
                    return newCust;
                  }}
                  itemToString={(c) => c.name}
                />
                {customerData && (
                  <Text>
                    Credit Limit: {customerData.credit_limit.toFixed(2)},
                    Balance: {customerData.balance.toFixed(2)}
                  </Text>
                )}
                <FormControl>
                  <FormLabel htmlFor="cash-sale">Cash Sale</FormLabel>
                  <Switch
                    id="cash-sale"
                    isChecked={isCashSale}
                    onChange={(e) => setIsCashSale(e.target.checked)}
                  />
                </FormControl>
              </VStack>

              {/* Right: Preview & Complete */}
              <VStack spacing={2} flex={1}>
                <Button colorScheme="yellow" onClick={handlePreview}>
                  Preview Sale
                </Button>
                <Button
                  colorScheme="green"
                  onClick={() => handleSubmit("complete")}
                >
                  Complete Sale
                </Button>
              </VStack>
            </HStack>

            <Divider mb={4} />

            {/* Bottom Row */}
            <HStack spacing={4}>
              {/* Left: Cart */}
              <VStack align="stretch" spacing={2} flex={3}>
                <Text fontWeight="bold">Cart Items</Text>
                {enrichedCart.length === 0 && <Text>No items in cart</Text>}
                {enrichedCart.map((item, idx) => (
                  <HStack key={idx} spacing={2}>
                    <Text flex={2}>
                      {products.find((p) => p.id === item.productId)?.name ||
                        item.productId}
                    </Text>
                    <NumberInput
                      min={1}
                      value={item.qty}
                      onChange={(v) => handleCartChange(idx, "qty", Number(v))}
                    >
                      <NumberInputField />
                    </NumberInput>
                    <NumberInput
                      min={0}
                      value={item.price}
                      onChange={(v) =>
                        handleCartChange(idx, "price", Number(v))
                      }
                    >
                      <NumberInputField />
                    </NumberInput>
                    <Text flex={1}>{(item.qty * item.price).toFixed(2)}</Text>
                    <IconButton
                      icon={<DeleteIcon />}
                      onClick={() => removeCartRow(idx)}
                    />
                  </HStack>
                ))}
              </VStack>

              {/* Right: Order Summary */}
              <VStack
                align="stretch"
                spacing={2}
                flex={1}
                p={2}
                border="1px solid #eee"
                borderRadius="md"
              >
                <Text fontWeight="bold">Order Summary</Text>
                <Text>Total: {totalAmount.toFixed(2)}</Text>
                <Text>Tax (10%): {(totalAmount * 0.1).toFixed(2)}</Text>
                <Text fontWeight="bold">
                  Grand Total: {(totalAmount * 1.1).toFixed(2)}
                </Text>
              </VStack>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup>
              <Button colorScheme="red" onClick={() => setCart([])}>
                Delete
              </Button>
              <Button colorScheme="gray" onClick={() => handleSubmit("draft")}>
                Save as Draft
              </Button>
              <Button colorScheme="blue" onClick={() => handleSubmit("edit")}>
                Edit
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Preview Sale Modal */}
      {previewSaleData && (
        <InvoiceDetails
          saleId={previewSaleData.id}
          isOpen={!!previewSaleData}
          onClose={() => previewSale(null)}
        />
      )}
    </>
  );
}
