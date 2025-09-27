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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ButtonGroup,
} from "@chakra-ui/react";
import { useProducts } from "../products/contexts/ProductsContext.jsx";
import { useSales } from "./contexts/SalesContext.jsx";

export default function InvoiceDetails({ saleId, isOpen, onClose }) {
  const { getSaleById, previewSaleData } = useSales();
  const { productsMap } = useProducts();

  // Determine the sale to display: preview first, then saved sale
  const sale = previewSaleData || (saleId ? getSaleById(saleId) : null);
  if (!sale) return null;

  const wrapText = (text, length = 12) => {
    const result = [];
    let start = 0;
    while (start < text.length) {
      result.push(text.slice(start, start + length));
      start += length;
    }
    return result;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice #: {sale.saleUuid}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack
            spacing={1}
            align="stretch"
            fontFamily="monospace"
            fontSize="sm"
            p={2}
          >
            <Text>Invoice #: {sale.saleUuid}</Text>
            <Text>Customer: {sale.customer?.name || "Walk-in"}</Text>
            <Divider />
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
                {(sale.items || []).map((item, idx) => {
                  const name =
                    productsMap[item.productId] ||
                    item.product?.name ||
                    item.productId;
                  const wrapped = wrapText(name, 12);
                  const lineTotal = (item.qty * item.price).toFixed(2);
                  return (
                    <React.Fragment key={`item-${idx}`}>
                      {wrapped.map((line, i) => (
                        <Tr key={`line-${i}`}>
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
                    </React.Fragment>
                  );
                })}
              </Tbody>
            </Table>
            <Divider />
            <Text>
              Payment:{" "}
              {sale.payment?.method || sale.payments?.[0]?.method || "—"}
            </Text>
            <Text>Total: {sale.total?.toFixed(2)}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Close</Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
