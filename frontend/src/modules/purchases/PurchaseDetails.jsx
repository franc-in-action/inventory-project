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
  ButtonGroup,
} from "@chakra-ui/react";
import { useProducts } from "../products/contexts/ProductsContext.jsx";
import { useVendors } from "../vendors/contexts/VendorsContext.jsx";

export default function PurchaseDetails({
  purchase,
  isOpen,
  onClose,
  onEdit,
  locations,
}) {
  const { products } = useProducts();
  const { vendorsMap } = useVendors();

  const totalAmount = (purchase?.items || []).reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Purchase Details - {purchase?.purchaseUuid}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              <strong>Vendor:</strong>{" "}
              {vendorsMap[purchase?.vendorId] || "Unknown Vendor"}
            </Text>
            <Text>
              <strong>Location:</strong>{" "}
              {locations.find((l) => l.id === purchase?.locationId)?.name ||
                "Unknown Location"}
            </Text>
            <Text>
              <strong>Status:</strong>{" "}
              {purchase?.received ? "✅ Received" : "⏳ Pending"}
            </Text>

            <Text fontWeight="bold">Items</Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Product</Th>
                  <Th isNumeric>Qty</Th>
                  <Th isNumeric>Price</Th>
                  <Th isNumeric>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(purchase?.items || []).map((item, idx) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <Tr key={idx}>
                      <Td>{product ? product.name : "Unknown Product"}</Td>
                      <Td isNumeric>{item.qty}</Td>
                      <Td isNumeric>{item.price.toLocaleString()}</Td>
                      <Td isNumeric>
                        {(item.qty * item.price).toLocaleString()}
                      </Td>
                    </Tr>
                  );
                })}
                <Tr>
                  <Td colSpan={3} textAlign="right" fontWeight="bold">
                    Total
                  </Td>
                  <Td isNumeric fontWeight="bold">
                    {totalAmount.toLocaleString()}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Close</Button>
            {/* 🔒 Disable edit button if purchase is already received */}
            <Button
              colorScheme="blue"
              onClick={() => onEdit(purchase)}
              isDisabled={purchase?.received}
              title={
                purchase?.received
                  ? "Cannot edit a purchase that has been received"
                  : ""
              }
            >
              Edit
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
