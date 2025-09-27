import React, { useState } from "react";
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
  Badge,
} from "@chakra-ui/react";
import { useProducts } from "../products/contexts/ProductsContext.jsx";
import { useSales } from "./contexts/SalesContext.jsx";
import InvoiceForm from "./InvoiceForm.jsx";

export default function InvoiceDetails({ saleId, isOpen, onClose }) {
  const { getSaleById, previewSaleData, closePreviewSale, finalizeDraft } =
    useSales();
  const { productsMap } = useProducts();

  const [editing, setEditing] = useState(false);

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

  const handleEdit = () => {
    closePreviewSale(); // close preview modal
    setEditing(true); // open InvoiceForm prefilled
  };

  const handleFinalize = async () => {
    try {
      await finalizeDraft(sale.id); // call context action
      onClose();
    } catch (err) {
      console.error("Failed to finalize draft:", err);
    }
  };

  // Color-coded status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETE":
        return <Badge colorScheme="green">Complete</Badge>;
      case "PENDING":
        return <Badge colorScheme="yellow">Draft</Badge>;
      case "CANCELLED":
        return <Badge colorScheme="red">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen && !editing} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            justifyContent="start"
            alignItems="center"
          >
            {getStatusBadge(sale.status)}
            <span>Invoice #: {sale.saleUuid}</span>
          </ModalHeader>
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
              <Text>Status: {sale.status}</Text>
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
              {sale.status === "PENDING" ? (
                <>
                  <Button colorScheme="green" onClick={handleFinalize}>
                    Finalize
                  </Button>
                  <Button colorScheme="blue" onClick={handleEdit}>
                    Edit
                  </Button>
                </>
              ) : (
                <Button
                  colorScheme="blue"
                  onClick={handleEdit}
                  isDisabled={sale.status === "CANCELLED"}
                >
                  Edit
                </Button>
              )}
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* InvoiceForm for editing the sale */}
      {editing && (
        <InvoiceForm
          isOpen={editing}
          onClose={() => setEditing(false)}
          saleData={sale} // pass sale to prefill form
        />
      )}
    </>
  );
}
