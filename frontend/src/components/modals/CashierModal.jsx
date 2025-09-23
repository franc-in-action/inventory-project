// src/components/modals/CashierModal.jsx
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
  Select,
  Input,
  useToast,
} from "@chakra-ui/react";
import { getCustomers } from "../../utils/customersUtils.js";
import { fetchProducts } from "../../utils/productsUtils.js";
import { createSale } from "../../utils/salesUtils.js";

export default function CashierModal({ isOpen, onClose, onSaleCreated }) {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState({ amount: 0, method: "cash" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const custs = await getCustomers();
      const prods = await fetchProducts();
      setCustomers(custs);
      setProducts(prods.products || prods);
    })();
  }, [isOpen]);

  const addToCart = (productId) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const exists = cart.find((c) => c.productId === productId);
    if (exists)
      setCart(
        cart.map((c) =>
          c.productId === productId ? { ...c, qty: c.qty + 1 } : c
        )
      );
    else setCart([...cart, { productId, qty: 1, price: prod.price }]);
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
        customerId: parseInt(selectedCustomer),
        items: cart,
        payment,
      });
      toast({ title: "Sale created", status: "success" });
      setCart([]);
      setSelectedCustomer("");
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
          <VStack spacing={3}>
            <Select
              placeholder="Select Customer"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Select Product"
              onChange={(e) => addToCart(parseInt(e.target.value))}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.price})
                </option>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="Payment amount"
              value={payment.amount}
              onChange={(e) =>
                setPayment({ ...payment, amount: parseFloat(e.target.value) })
              }
            />
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
          </VStack>
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
