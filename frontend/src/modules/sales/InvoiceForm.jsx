import { useState, useEffect } from "react";
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

export default function InvoiceForm({ isOpen, onClose }) {
  const toast = useToast();
  const { products, stockMap } = useProducts();
  const { customers, refreshCustomers, getCustomerById, createCustomer } =
    useCustomers();
  const { addSale } = useSales(); // <-- use context addSale

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [cart, setCart] = useState([
    { productId: "", qty: 1, price: 0, locationId: "", stockQty: 0 },
  ]);
  const [payment, setPayment] = useState({ amount: 0, method: "cash" });
  const [loading, setLoading] = useState(false);
  const [isCashSale, setIsCashSale] = useState(false);

  useEffect(() => {
    if (isOpen) refreshCustomers();
  }, [isOpen, refreshCustomers]);

  useEffect(() => {
    if (!selectedCustomer) return setCustomerData(null);
    (async () => {
      try {
        const data = await getCustomerById(selectedCustomer.id);
        setCustomerData(data);
      } catch {
        setCustomerData(null);
      }
    })();
  }, [selectedCustomer, getCustomerById]);

  useEffect(() => {
    setCart((prev) =>
      prev.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return item;
        return {
          ...item,
          price: product.price || 0,
          locationId: product.locationId || "",
          stockQty: stockMap[product.id] || 0,
        };
      })
    );
  }, [products, stockMap]);

  useEffect(() => {
    if (isCashSale)
      setPayment((prev) => ({
        ...prev,
        amount: cart.reduce((sum, i) => sum + i.qty * i.price, 0),
      }));
  }, [isCashSale, cart]);

  const handleCartChange = (index, field, value) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      if (field === "productId") {
        const product = products.find((p) => p.id === value);
        copy[index].locationId = product?.locationId || "";
        copy[index].price = product?.price || 0;
        copy[index].stockQty = stockMap[product?.id] || 0;
      }
      return copy;
    });
  };

  const addCartRow = () =>
    setCart((prev) => [
      ...prev,
      { productId: "", qty: 1, price: 0, locationId: "", stockQty: 0 },
    ]);
  const removeCartRow = (i) =>
    setCart((prev) => prev.filter((_, idx) => idx !== i));

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedCustomer ||
      cart.length === 0 ||
      cart.some((i) => !i.productId || i.qty <= 0)
    ) {
      return toast({
        status: "warning",
        description: "Select customer and fill all product rows",
      });
    }

    const locationId = cart[0].locationId;
    if (cart.some((item) => item.locationId !== locationId)) {
      return toast({
        status: "error",
        description: "All products must belong to the same location",
      });
    }

    const insufficient = cart.find(
      (item) => item.qty > (stockMap[item.productId] || 0)
    );
    if (insufficient) {
      const product = products.find((p) => p.id === insufficient.productId);
      return toast({
        status: "error",
        description: `Insufficient stock for "${product?.name}"`,
      });
    }

    if (!isCashSale && customerData) {
      const remainingCredit = customerData.credit_limit - customerData.balance;
      const creditRequired = totalAmount - (payment.amount || 0);
      if (creditRequired > remainingCredit) {
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
        locationId,
        customerId: selectedCustomer.id,
        items: cart.map(({ productId, qty, price }) => ({
          productId,
          qty,
          price,
        })),
        payment,
        total: totalAmount,
      });

      toast({ status: "success", description: "Invoice created successfully" });

      setCart([
        { productId: "", qty: 1, price: 0, locationId: "", stockQty: 0 },
      ]);
      setSelectedCustomer(null);
      setCustomerData(null);
      setPayment({ amount: 0, method: "cash" });
      setIsCashSale(false);

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
            {/* Customer Selection */}
            <Box>
              <Text>Customer</Text>
              <ComboBox
                items={customers}
                selectedItemId={selectedCustomer?.id}
                placeholder="Select or add customer"
                onSelect={setSelectedCustomer}
                createNewItem={async (name) => {
                  const newCust = await createCustomer({ name });
                  refreshCustomers();
                  return newCust;
                }}
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

            {/* Products */}
            <Box>
              <Text>Products</Text>
              <VStack>
                {cart.map((item, idx) => {
                  const stockExceeded = item.qty > item.stockQty;
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <Box key={idx}>
                      <HStack spacing={2}>
                        <Select
                          placeholder="Select Product"
                          value={item.productId}
                          onChange={(e) =>
                            handleCartChange(idx, "productId", e.target.value)
                          }
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

            {/* Payment */}
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
