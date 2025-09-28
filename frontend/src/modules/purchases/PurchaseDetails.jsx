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
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ButtonGroup,
  useToast,
} from "@chakra-ui/react";
import { useProducts } from "../products/contexts/ProductsContext.jsx";
import { useVendors } from "../vendors/contexts/VendorsContext.jsx";
import { usePurchases } from "./contexts/PurchasesContext.jsx";

export default function PurchaseDetails({
  purchase,
  isOpen,
  onClose,
  onEdit,
  locations,
}) {
  const { products, openProductDetails } = useProducts();
  const { vendorsMap } = useVendors();
  const { markReceived } = usePurchases();
  const toast = useToast(); // ✅ Add toast

  const totalAmount = (purchase?.items || []).reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

  const handleReceive = async () => {
    if (!purchase) return;
    try {
      await markReceived(purchase.id); // backend still uses UUID
      toast({
        title: "Purchase received",
        description: `Purchase #${purchase.purchaseUuid} has been marked as received.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      console.error("Failed to mark received", err);
      toast({
        title: "Error",
        description: `Failed to receive Purchase #${purchase.purchaseUuid}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Purchase #{purchase?.purchaseUuid}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
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

            <Text>Items</Text>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                    Product
                  </Th>
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
                      <Td>
                        {product ? (
                          <Link
                            onClick={() =>
                              openProductDetails(
                                product.id,
                                purchase?.locationId
                              )
                            }
                          >
                            {product.name}
                          </Link>
                        ) : (
                          "Unknown Product"
                        )}
                      </Td>
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
            <Button
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
            {!purchase?.received && (
              <Button colorScheme="green" onClick={handleReceive}>
                Receive
              </Button>
            )}
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
