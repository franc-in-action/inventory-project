import React from "react";

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
  Divider,
  HStack,
  useToast,
  ButtonGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { useProducts } from "../products/contexts/ProductsContext.jsx";

export default function InvoiceDetails({ sale, isOpen, onClose }) {
  const { productsMap } = useProducts();
  const toast = useToast();

  const receiptOptions = {
    storeName: "★ MY STORE ★",
    storeAddress: "123 Main St, City, State ZIP",
    storeTel: "Tel: 012-345-6789",
    storeTaxPin: "123456789",
    customerTaxPin: "987654321",
    cashier: "John Doe",
    paybill: "500000",
    taxRate: 0.05,
  };

  const date = new Date(sale?.createdAt || Date.now());
  const subtotal = (sale?.items || []).reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );
  const tax = subtotal * receiptOptions.taxRate;
  const total = subtotal + tax;

  const wrapText = (text, length = 12) => {
    const result = [];
    let start = 0;
    while (start < text.length) {
      result.push(text.slice(start, start + length));
      start += length;
    }
    return result;
  };

  const handlePrint = () => {
    if (!window.api) {
      toast({ status: "error", description: "Printing not available" });
      return;
    }
    window.api.printHTML(document.getElementById("receipt-html").innerHTML);
    toast({ status: "success", description: "Sent to printer" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack
            id="receipt-html"
            spacing={1}
            align="stretch"
            fontFamily="monospace"
            fontSize="sm"
            p={2}
          >
            {/* Header */}
            <Text textAlign="center" fontWeight="bold">
              {receiptOptions.storeName}
            </Text>
            <Text textAlign="center">{receiptOptions.storeAddress}</Text>
            <Text textAlign="center">{receiptOptions.storeTel}</Text>
            <Text textAlign="center">
              Tax PIN: {receiptOptions.storeTaxPin}
            </Text>
            <Divider />

            {/* Sale info */}
            <Text>
              Date: {date.toLocaleDateString()} Time:{" "}
              {date.toLocaleTimeString()}
            </Text>
            <Text>Receipt #: {sale?.saleUuid || sale?.id}</Text>
            <Text>Customer: {sale?.customer?.name || "Walk-in"}</Text>
            <Text>Tax PIN: {receiptOptions.customerTaxPin}</Text>
            <Divider />

            {/* Items table */}
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Item</Th>
                  <Th isNumeric>Qty</Th>
                  <Th isNumeric>Price</Th>
                  <Th isNumeric>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(sale?.items || []).map((item, idx, arr) => {
                  const name =
                    productsMap[item.productId] ||
                    item.product?.name ||
                    item.productId;
                  const wrapped = wrapText(name, 12);
                  const lineTotal = (item.qty * item.price).toFixed(2);

                  // Wrap the fragment with a key
                  return (
                    <React.Fragment key={`item-${idx}`}>
                      {wrapped.map((line, i) => (
                        <Tr key={`item-${idx}-line-${i}`}>
                          <Td>{line}</Td>
                          {i === 0 ? (
                            <>
                              <Td isNumeric>{item.qty}</Td>
                              <Td isNumeric>{item.price.toFixed(2)}</Td>
                              <Td isNumeric>{lineTotal}</Td>
                            </>
                          ) : (
                            <>
                              <Td />
                              <Td />
                              <Td />
                            </>
                          )}
                        </Tr>
                      ))}
                      {idx < arr.length - 1 && (
                        <Tr key={`divider-${idx}`}>
                          <Td colSpan={4}>
                            <Divider />
                          </Td>
                        </Tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </Tbody>
            </Table>

            {/* Payment */}
            {sale?.payments?.length > 0 && (
              <Text>Payment: {sale.payments[0].method.toUpperCase()}</Text>
            )}
            <Divider />

            {/* Footer */}
            <Text>MPESA Paybill: {receiptOptions.paybill}</Text>
            <Text>Cashier: {receiptOptions.cashier}</Text>
            <Divider />
            <Text textAlign="center" fontWeight="bold">
              THANK YOU FOR SHOPPING!
            </Text>
            <Text textAlign="center">Visit us again soon!</Text>
            <Divider />
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
