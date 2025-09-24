import { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
  HStack,
  useToast,
  Spacer,
} from "@chakra-ui/react";
import { fetchProducts } from "../products/productsApi.js";

export default function InvoiceDetails({ sale, isOpen, onClose }) {
  const [items, setItems] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const toast = useToast();
  const invoiceRef = useRef();

  useEffect(() => {
    if (!isOpen) return;

    setItems(sale?.items || []);

    const loadProducts = async () => {
      try {
        const result = await fetchProducts();
        const productsArray = Array.isArray(result)
          ? result
          : result.products || [];
        const map = {};
        productsArray.forEach((p) => (map[p.id] = p.name));
        setProductsMap(map);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    loadProducts();
  }, [sale, isOpen]);

  const totalAmount = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  const handlePrint = () => {
    if (!window.api || !invoiceRef.current) {
      toast({ status: "error", description: "Printing not available" });
      return;
    }
    const htmlContent = invoiceRef.current.innerHTML;
    window.api.printHTML(htmlContent);
    toast({ status: "success", description: "Sent to printer" });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      p={2}
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch" ref={invoiceRef}>
            <VStack spacing={1} align="stretch">
              <Text fontSize="lg" fontWeight="bold">
                My Store
              </Text>
              <Spacer />
              <Text fontSize="lg">Invoice No </Text>
              <Text fontSize="sm" fontWeight="bold">
                {sale?.saleUuid || sale?.id}
              </Text>
              <Spacer />
              <Text>Customer: {sale?.customer?.name || "Walk-in"}</Text>
              <Text fontSize="sm">
                Date: {new Date(sale?.createdAt).toLocaleString()}
              </Text>
              <Divider />
            </VStack>

            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Product</Th>
                  <Th>Qty</Th>
                  <Th>Price</Th>
                  <Th>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item, idx) => (
                  <Tr key={idx}>
                    <Td>{productsMap[item.productId] || item.productId}</Td>{" "}
                    {/* ✅ use name */}
                    <Td>{item.qty}</Td>
                    <Td>{item.price.toFixed(2)}</Td>
                    <Td>{(item.qty * item.price).toFixed(2)}</Td>
                  </Tr>
                ))}
                <Tr>
                  <Td colSpan={3} fontWeight="bold" textAlign="right">
                    TOTAL
                  </Td>
                  <Td fontWeight="bold">{totalAmount.toFixed(2)}</Td>
                </Tr>
              </Tbody>
            </Table>

            {sale.payments?.length > 0 && (
              <VStack align="stretch" mt={2}>
                <Text fontWeight="bold">Payments</Text>
                {sale.payments.map((p, i) => (
                  <Text key={i}>
                    {p.amount.toFixed(2)} via {p.method}
                  </Text>
                ))}
              </VStack>
            )}

            <Divider />
            <Text fontSize="sm" textAlign="center">
              Thank you for your purchase!
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2}>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="blue" onClick={handlePrint}>
              Print
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
