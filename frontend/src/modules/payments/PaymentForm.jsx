import { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Box,
  Text,
  Badge,
  useOutsideClick,
  ButtonGroup,
} from "@chakra-ui/react";
import { CloseBtn } from "../../components/Xp.jsx"; // import your custom CloseBtn

import { useSales } from "../sales/contexts/SalesContext.jsx";
import { usePayments } from "./contexts/PaymentsContext.jsx";
import { useCustomers } from "../customers/contexts/CustomersContext.jsx";

export default function PaymentForm({ paymentId, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const { sales } = useSales();
  const {
    customers,
    loading: customersLoading,
    error: customersError,
  } = useCustomers();
  const { createPayment, getPayment } = usePayments();

  const [payment, setPayment] = useState({
    customerId: "",
    saleId: "",
    amount: 0,
    method: "cash",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        if (paymentId) {
          const data = await getPayment(paymentId);
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
        toast({ status: "error", description: "Failed to load payment" });
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, paymentId, getPayment, toast]);

  // Filter sales by customer & search
  useEffect(() => {
    if (!payment.customerId) {
      setFilteredSales([]);
      setPayment((prev) => ({ ...prev, saleId: "" }));
    } else {
      let filtered = sales.filter((s) => s.customer?.id === payment.customerId);
      if (searchTerm)
        filtered = filtered.filter((s) =>
          s.saleUuid.toLowerCase().includes(searchTerm.toLowerCase())
        );
      setFilteredSales(filtered);
      if (!filtered.find((s) => s.id === payment.saleId))
        setPayment((prev) => ({ ...prev, saleId: filtered[0]?.id || "" }));
    }
  }, [payment.customerId, sales, searchTerm, payment.saleId]);

  const handleChange = (e) =>
    setPayment((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...payment, amount: parseFloat(payment.amount) };
      if (!payload.amount || payload.amount <= 0)
        return toast({
          status: "error",
          description: "Amount must be positive",
        });

      if (paymentId) {
        await updatePayment(paymentId, payload);
        toast({ status: "success", description: "Payment updated" });
      } else {
        await createPayment(payload);
        toast({ status: "success", description: "Payment created" });
      }
      onSaved();
      onClose();
    } catch (err) {
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const selectedSale = filteredSales.find((s) => s.id === payment.saleId);
  const customerOutstanding = sales
    .filter((s) => s.customer?.id === payment.customerId)
    .reduce(
      (sum, s) =>
        sum +
        (s.total - (s.payments?.reduce((a, p) => a + (p.amount || 0), 0) || 0)),
      0
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>
          {paymentId
            ? `Edit Payment #${payment.paymentNumber || ""}`
            : "Add Payment"}
        </ModalHeader>

        <CloseBtn onClick={onClose} />
        <ModalBody>
          {loading || customersLoading ? (
            <Spinner />
          ) : customersError ? (
            <Text>Failed to load customers</Text>
          ) : (
            <VStack>
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
                {payment.customerId && (
                  <Text>Outstanding Balance: {customerOutstanding}</Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Sale</FormLabel>
                <Box position="relative" ref={dropdownRef}>
                  <Input
                    // size="sm"
                    readOnly
                    placeholder="Select sale"
                    value={
                      selectedSale
                        ? `${selectedSale.saleUuid} ${
                            selectedSale.total -
                              (selectedSale.payments?.reduce(
                                (a, p) => a + (p.amount || 0),
                                0
                              ) || 0) >
                            0
                              ? "(Unpaid)"
                              : "(Paid)"
                          } | Total: ${selectedSale.total}`
                        : ""
                    }
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    cursor="pointer"
                  />
                  {dropdownOpen && (
                    <VStack
                      spacing={1}
                      maxH="200px"
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
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">{s.saleUuid}</Text>
                              <Badge
                                colorScheme={
                                  s.total -
                                    (s.payments?.reduce(
                                      (a, p) => a + (p.amount || 0),
                                      0
                                    ) || 0) >
                                  0
                                    ? "red"
                                    : "green"
                                }
                                fontSize="0.7em"
                              >
                                {s.total -
                                  (s.payments?.reduce(
                                    (a, p) => a + (p.amount || 0),
                                    0
                                  ) || 0) >
                                0
                                  ? `Unpaid | Total: ${s.total}`
                                  : `Paid | Total: ${s.total}`}
                              </Badge>
                            </VStack>
                          </Box>
                        ))
                      )}
                    </VStack>
                  )}
                </Box>
              </FormControl>

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
          <ButtonGroup>
            <Button onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saving}
              colorScheme="teal"
              size="sm"
            >
              {paymentId ? "Update" : "Create"}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
