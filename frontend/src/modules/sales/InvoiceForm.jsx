import { useState, useEffect, useMemo } from "react";
import {
  Box,
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
  Divider,
  useToast,
  IconButton,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

import ComboBox from "../../components/ComboBox.jsx";
import { useProducts } from "../products/contexts/ProductsContext.jsx";
import { useCustomers } from "../customers/contexts/CustomersContext.jsx";
import { useSales } from "./contexts/SalesContext.jsx";
import { fetchNextSaleNumber } from "./salesApi.js";

export default function InvoiceForm({ isOpen, onClose }) {
  const toast = useToast();
  const { products, stockMap } = useProducts();
  const { customers, reloadCustomers, fetchCustomerById, createCustomer } =
    useCustomers();
  const { addSale } = useSales();

  const [saleUuid, setSaleUuid] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [cart, setCart] = useState([{ productId: "", qty: 1 }]);
  const [payment, setPayment] = useState({ amount: 0, method: "cash" });
  const [isCashSale, setIsCashSale] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch next invoice number & customers when modal opens
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

  // Update cart items with latest product info
  const enrichedCart = useMemo(
    () =>
      cart.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          ...item,
          price: product?.price || 0,
          locationId: product?.locationId || "",
          stockQty: stockMap[product?.id] || 0,
        };
      }),
    [cart, products, stockMap]
  );

  // Compute total amount
  const totalAmount = useMemo(
    () => enrichedCart.reduce((sum, i) => sum + i.qty * i.price, 0),
    [enrichedCart]
  );

  // Auto-set payment amount for cash sale
  useEffect(() => {
    if (isCashSale) setPayment((prev) => ({ ...prev, amount: totalAmount }));
  }, [isCashSale, totalAmount]);

  const handleCartChange = (index, field, value) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const addCartRow = () =>
    setCart((prev) => [...prev, { productId: "", qty: 1 }]);
  const removeCartRow = (index) =>
    setCart((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedCustomer ||
      enrichedCart.length === 0 ||
      enrichedCart.some((i) => !i.productId || i.qty <= 0)
    ) {
      return toast({
        status: "warning",
        description: "Select customer and fill all product rows",
      });
    }

    const locationId = enrichedCart[0].locationId;
    if (enrichedCart.some((i) => i.locationId !== locationId)) {
      return toast({
        status: "error",
        description: "All products must belong to the same location",
      });
    }

    const insufficient = enrichedCart.find((i) => i.qty > i.stockQty);
    if (insufficient) {
      const product = products.find((p) => p.id === insufficient.productId);
      return toast({
        status: "error",
        description: `Insufficient stock for "${product?.name}"`,
      });
    }

    if (!isCashSale && customerData) {
      const remainingCredit = customerData.credit_limit - customerData.balance;
      if (totalAmount - payment.amount > remainingCredit) {
        return toast({
          status: "error",
          description: `Credit limit exceeded. Available credit: ${remainingCredit.toFixed(
            2
          )}`,
        });
      }
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
      });

      toast({ status: "success", description: "Invoice created successfully" });

      setCart([{ productId: "", qty: 1 }]);
      setSelectedCustomer(null);
      setCustomerData(null);
      setPayment({ amount: 0, method: "cash" });
      setIsCashSale(false);
      setSaleUuid("");
      onClose();
    } catch (err) {
      toast({ status: "error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Generate Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box>
              <Text fontWeight="bold">
                Invoice #: {saleUuid || "Generating..."}
              </Text>
            </Box>

            <Box>
              <Text>Customer</Text>
              <ComboBox
                items={customers}
                selectedItemId={selectedCustomer?.id}
                placeholder="Select or add customer"
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
                  Credit Limit: {customerData.credit_limit.toFixed(2)}, Balance:{" "}
                  {customerData.balance.toFixed(2)}
                </Text>
              )}
            </Box>

            <FormControl>
              <FormLabel htmlFor="cash-sale">Cash Sale</FormLabel>
              <Switch
                id="cash-sale"
                isChecked={isCashSale}
                onChange={(e) => setIsCashSale(e.target.checked)}
              />
            </FormControl>

            <Box>
              <Text>Products</Text>
              <VStack>
                {enrichedCart.map((item, idx) => {
                  const stockExceeded = item.qty > item.stockQty;
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <Box key={idx}>
                      <HStack spacing={2}>
                        <Select
                          value={item.productId}
                          onChange={(e) =>
                            handleCartChange(idx, "productId", e.target.value)
                          }
                          placeholder="Select Product"
                          required
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (SKU: {p.sku})
                            </option>
                          ))}
                        </Select>

                        <NumberInput
                          min={1}
                          value={item.qty}
                          onChange={(v) =>
                            handleCartChange(idx, "qty", Number(v))
                          }
                        >
                          <NumberInputField placeholder="Qty" />
                        </NumberInput>

                        <NumberInput
                          min={0}
                          value={item.price}
                          onChange={(v) =>
                            handleCartChange(idx, "price", Number(v))
                          }
                        >
                          <NumberInputField placeholder="Price" />
                        </NumberInput>

                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => removeCartRow(idx)}
                        />
                      </HStack>
                      {stockExceeded && product && (
                        <Text>
                          Only {item.stockQty} units of "{product.name}"
                          available.
                        </Text>
                      )}
                    </Box>
                  );
                })}
                <Button leftIcon={<AddIcon />} onClick={addCartRow}>
                  Add Item
                </Button>
              </VStack>
            </Box>

            <Divider />

            <HStack spacing={2}>
              <NumberInput
                min={0}
                value={payment.amount}
                onChange={(v) => setPayment({ ...payment, amount: Number(v) })}
                isReadOnly={isCashSale}
              >
                <NumberInputField placeholder="Payment Amount" />
              </NumberInput>

              <Select
                value={payment.method}
                onChange={(e) =>
                  setPayment({ ...payment, method: e.target.value })
                }
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mpesa">M-Pesa</option>
              </Select>
            </HStack>

            <Text>Total: {totalAmount.toFixed(2)}</Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={loading}>
            Generate Invoice
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
