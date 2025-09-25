import {
  useToast,
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
  ButtonGroup,
} from "@chakra-ui/react";
import { useProducts } from "../products/contexts/ProductsContext.jsx";
import { formatReceipt } from "./salesApi.js";

export default function SaleInvoiceThermal({ sale, isOpen, onClose }) {
  const toast = useToast();
  const { productsMap } = useProducts(); // ✅ get product names

  const handlePrint = () => {
    if (!window.api) {
      toast({ status: "error", description: "Printing not available" });
      return;
    }
    window.api.printText(formatReceipt(sale, productsMap));
    toast({ status: "success", description: "Sent to printer" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice - {sale?.saleUuid || sale?.id}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
            <Text whiteSpace="pre-wrap">
              {formatReceipt(sale, productsMap)}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Close</Button>
            <Button onClick={handlePrint}>Print</Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
