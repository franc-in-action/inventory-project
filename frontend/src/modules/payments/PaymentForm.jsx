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
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Select,
} from "@chakra-ui/react";
import { createPayment, getPaymentById } from "./paymentsApi.js";
import { getCustomers } from "../customers/customersApi.js";
import { fetchSales } from "../sales/salesApi.js";

export default function PaymentForm({ paymentId, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const [payment, setPayment] = useState({
    customerId: "",
    saleId: "",
    amount: 0,
    method: "cash",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    (async () => {
      try {
        const [custs, salesData] = await Promise.all([
          getCustomers(),
          fetchSales(),
        ]);
        setCustomers(custs);
        setSales(salesData.items);

        if (paymentId) {
          const data = await getPaymentById(paymentId);
          setPayment({
            customerId: data.customerId || "",
            saleId: data.saleId || "",
            amount: data.amount || 0,
            method: data.method || "cash",
          });
        } else {
          setPayment({ customerId: "", saleId: "", amount: 0, method: "cash" });
        }
      } catch (err) {
        toast({ status: "error", description: "Failed to load data" });
      } finally {
        setLoading(false);
      }
    })();
  }, [paymentId, isOpen, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPayment(payment);
      toast({ status: "success", description: "Payment created" });
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
        <ModalHeader>{paymentId ? "Edit Payment" : "Add Payment"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Customer</FormLabel>
                <Select
                  name="customerId"
                  value={payment.customerId}
                  onChange={handleChange}
                  placeholder="Select customer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Sale</FormLabel>
                <Select
                  name="saleId"
                  value={payment.saleId}
                  onChange={handleChange}
                  placeholder="Select sale"
                >
                  {sales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.saleUuid} ({s.customer?.name || "Walk-in"})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input
                  type="number"
                  name="amount"
                  value={payment.amount}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Method</FormLabel>
                <Select
                  name="method"
                  value={payment.method}
                  onChange={handleChange}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank</option>
                </Select>
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={saving}>
            {paymentId ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
