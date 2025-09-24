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
} from "@chakra-ui/react";
import { useProducts } from "../products/contexts/ProductsContext.jsx";

export default function SaleInvoiceThermal({ sale, isOpen, onClose }) {
  const { productsMap } = useProducts(); // ✅ get product names from context
  const toast = useToast();

  const generateReceiptText = () => {
    const lines = [];
    lines.push("==== MY STORE ====");
    lines.push(`Sale: ${sale?.saleUuid || sale?.id}`);
    lines.push(`Date: ${new Date(sale?.createdAt).toLocaleString()}`);
    lines.push(`Customer: ${sale?.customer?.name || "Walk-in"}`);
    lines.push("-----------------------------");

    let total = 0;
    (sale.items || []).forEach((item) => {
      const name = productsMap[item.productId] || item.productId;
      const lineTotal = item.qty * item.price;
      total += lineTotal;
      lines.push(`${name} x${item.qty}`);
      lines.push(`  ${item.price.toFixed(2)}  ${lineTotal.toFixed(2)}`);
    });

    lines.push("-----------------------------");
    lines.push(`TOTAL: ${total.toFixed(2)}`);

    if (sale.payments?.length) {
      lines.push("Payments:");
      sale.payments.forEach((p) => {
        lines.push(`  ${p.amount.toFixed(2)} via ${p.method}`);
      });
    }

    lines.push("-----------------------------");
    lines.push("Thank you for your purchase!");
    lines.push("\n\n");

    return lines.join("\n");
  };

  const handlePrint = () => {
    if (!window.api) {
      toast({ status: "error", description: "Printing not available" });
      return;
    }
    const text = generateReceiptText();
    window.api.printText(text);
    toast({ status: "success", description: "Sent to printer" });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice - {sale?.saleUuid || sale?.id}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={2}>
            <Text whiteSpace="pre" fontFamily="monospace">
              {generateReceiptText()}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="blue" onClick={handlePrint}>
            Print
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
