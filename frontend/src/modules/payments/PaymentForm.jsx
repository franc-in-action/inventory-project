import { useState, useEffect, useRef } from "react";
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
  Box,
  Text,
  StackDivider,
  useOutsideClick,
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
  const [filteredSales, setFilteredSales] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dropdownRef = useRef();
  useOutsideClick({ ref: dropdownRef, handler: () => setDropdownOpen(false) });

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

  useEffect(() => {
    if (!payment.customerId) {
      setFilteredSales([]);
      setPayment((prev) => ({ ...prev, saleId: "" }));
    } else {
      let filtered = sales.filter((s) => s.customer?.id === payment.customerId);
      if (searchTerm) {
        filtered = filtered.filter((s) =>
          s.saleUuid.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredSales(filtered);

      if (!filtered.find((s) => s.id === payment.saleId)) {
        setPayment((prev) => ({ ...prev, saleId: filtered[0]?.id || "" }));
      }
    }
  }, [payment.customerId, sales, searchTerm, payment.saleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPayment(payment);
      toast({ status: "success", description: "Payment saved" });
      onSaved();
      onClose();
    } catch (err) {
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const selectedSale = filteredSales.find((s) => s.id === payment.saleId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>{paymentId ? "Edit Payment" : "Add Payment"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack spacing={4} align="stretch">
              {/* Customer select */}
              <FormControl>
                <FormLabel>Customer</FormLabel>
                <select
                  name="customerId"
                  value={payment.customerId}
                  onChange={(e) => {
                    handleChange(e);
                    setDropdownOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormControl>

              {/* Sale dropdown with search */}
              <FormControl>
                <FormLabel>Sale</FormLabel>
                <Box position="relative" ref={dropdownRef}>
                  <Input
                    size="sm"
                    readOnly
                    placeholder="Select sale"
                    value={
                      selectedSale
                        ? `${selectedSale.saleUuid} | Unpaid: ${
                            selectedSale.unpaidBalance || 0
                          }`
                        : ""
                    }
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    cursor="pointer"
                  />

                  {dropdownOpen && (
                    <VStack
                      spacing={1}
                      maxH="180px"
                      overflowY="auto"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="white"
                      position="absolute"
                      width="100%"
                      zIndex={10}
                      mt={1}
                      p={2}
                    >
                      <Input
                        size="sm"
                        placeholder="Search Invoice No"
                        mb={2}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />

                      {filteredSales.length === 0 ? (
                        <Text fontSize="sm">No sales found</Text>
                      ) : (
                        filteredSales.map((s) => (
                          <Box
                            key={s.id}
                            p={1}
                            w="100%"
                            borderRadius="md"
                            border={
                              payment.saleId === s.id
                                ? "2px solid teal"
                                : "1px solid gray"
                            }
                            bg={payment.saleId === s.id ? "teal.50" : "white"}
                            cursor="pointer"
                            fontSize="sm"
                            onClick={() => {
                              setPayment((prev) => ({ ...prev, saleId: s.id }));
                              setDropdownOpen(false);
                              setSearchTerm("");
                            }}
                          >
                            <Text fontWeight="bold">{s.saleUuid}</Text>
                            <Text>Unpaid: {s.unpaidBalance || 0}</Text>
                          </Box>
                        ))
                      )}
                    </VStack>
                  )}
                </Box>
              </FormControl>

              {/* Amount */}
              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input
                  size="sm"
                  type="number"
                  name="amount"
                  value={payment.amount}
                  onChange={handleChange}
                />
              </FormControl>

              {/* Payment method */}
              <FormControl>
                <FormLabel>Method</FormLabel>
                <select
                  name="method"
                  value={payment.method}
                  onChange={handleChange}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank</option>
                </select>
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} colorScheme="teal" size="sm">
            {paymentId ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
