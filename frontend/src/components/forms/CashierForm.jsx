// src/components/modals/CashierForm.jsx
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
  Flex,
  Box,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import ComboBox from "../ComboBox.jsx";
import { getCustomers, createCustomer } from "../../utils/customersUtils.js";
import { fetchProducts, createProduct } from "../../utils/productsUtils.js";
import { createSale } from "../../utils/salesUtils.js";

export default function CashierForm({ isOpen, onClose, onSaleCreated }) {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState({ amount: 0, method: "cash" });
  const [loading, setLoading] = useState(false);

  // Fetch customers and products when modal opens
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const custs = await getCustomers();
        const prods = await fetchProducts();
        setCustomers(custs);
        setProducts(prods.products || prods);
      } catch (err) {
        toast({
          title: "Error loading data",
          description: err.message,
          status: "error",
        });
      }
    })();
  }, [isOpen, toast]);

  const addToCart = (product) => {
    if (!product) return;
    const exists = cart.find((c) => c.productId === product.id);
    if (exists) {
      setCart(
        cart.map((c) =>
          c.productId === product.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      setCart([
        ...cart,
        { productId: product.id, qty: 1, price: product.price },
      ]);
    }
  };

  const handleSale = async () => {
    if (!selectedCustomer || cart.length === 0) {
      toast({ title: "Select customer and add products", status: "warning" });
      return;
    }
    setLoading(true);
    try {
      await createSale({
        locationId: 1,
        customerId: selectedCustomer.id,
        items: cart,
        payment,
      });
      toast({ title: "Sale created", status: "success" });
      setCart([]);
      setSelectedCustomer(null);
      setPayment({ amount: 0, method: "cash" });
      onSaleCreated();
      onClose();
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Sale</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap={4}>
            <Box>
              <Text fontSize="sm" mb={1}>
                Customer
              </Text>
              <ComboBox
                items={customers}
                selectedItemId={selectedCustomer?.id}
                placeholder="Select or add customer"
                onSelect={setSelectedCustomer}
                createNewItem={async (name) => {
                  const newCust = await createCustomer({ name });
                  setCustomers((prev) => [...prev, newCust]);
                  return newCust;
                }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" mb={1}>
                Product
              </Text>
              <ComboBox
                items={products}
                placeholder="Select or add product"
                onSelect={addToCart}
                createNewItem={async (name) => {
                  const newProd = await createProduct({ name, price: 0 });
                  setProducts((prev) => [...prev, newProd]);
                  return newProd;
                }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" mb={1}>
                Payment Amount
              </Text>
              <Input
                type="number"
                placeholder="Enter amount"
                value={payment.amount}
                onChange={(e) =>
                  setPayment({
                    ...payment,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </Box>

            <Box>
              <Text fontSize="sm" mb={1}>
                Payment Method
              </Text>
              <ComboBox
                items={[
                  { id: "cash", name: "Cash" },
                  { id: "card", name: "Card" },
                  { id: "mpesa", name: "M-Pesa" },
                ]}
                selectedItemId={payment.method}
                placeholder="Select payment method"
                onSelect={(item) => setPayment({ ...payment, method: item.id })}
              />
            </Box>
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="green" onClick={handleSale} isLoading={loading}>
            Complete Sale
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
