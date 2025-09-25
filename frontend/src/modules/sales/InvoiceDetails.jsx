import { useRef } from "react";
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
  Spacer,
  useToast,
  ButtonGroup,
} from "@chakra-ui/react";
import { useProducts } from "../products/contexts/ProductsContext.jsx";

export default function InvoiceDetails({ sale, isOpen, onClose }) {
  const { productsMap } = useProducts();
  const toast = useToast();
  const invoiceRef = useRef();

  const totalAmount = (sale?.items || []).reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack ref={invoiceRef}>
            <VStack>
              <Text>My Store</Text>
              <Spacer />
              <Text>Invoice No</Text>
              <Text>{sale?.saleUuid || sale?.id}</Text>
              <Spacer />
              <Text>Customer: {sale?.customer?.name || "Walk-in"}</Text>
              <Text>Date: {new Date(sale?.createdAt).toLocaleString()}</Text>
              <Divider />
            </VStack>

            <Table>
              <Thead>
                <Tr>
                  <Th>Product</Th>
                  <Th>Qty</Th>
                  <Th>Price</Th>
                  <Th>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(sale?.items || []).map((item, idx) => (
                  <Tr key={idx}>
                    <Td>{productsMap[item.productId] || item.productId}</Td>
                    <Td>{item.qty}</Td>
                    <Td>{item.price.toFixed(2)}</Td>
                    <Td>{(item.qty * item.price).toFixed(2)}</Td>
                  </Tr>
                ))}
                <Tr>
                  <Td colSpan={3}>TOTAL</Td>
                  <Td>{totalAmount.toFixed(2)}</Td>
                </Tr>
              </Tbody>
            </Table>

            {sale.payments?.length > 0 && (
              <VStack>
                <Text>Payments</Text>
                {sale.payments.map((p, i) => (
                  <Text key={i}>
                    {p.amount.toFixed(2)} via {p.method}
                  </Text>
                ))}
              </VStack>
            )}

            <Divider />
            <Text>Thank you for your purchase!</Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack>
            <ButtonGroup>
              <Button onClick={onClose}>Close</Button>
              <Button onClick={handlePrint}>Print</Button>
            </ButtonGroup>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
