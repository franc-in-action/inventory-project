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
  ButtonGroup,
  Text,
} from "@chakra-ui/react";
import { useProducts } from "../products/contexts/ProductsContext.jsx";
import { useSales } from "./contexts/SalesContext.jsx";
import { formatReceipt } from "./salesApi.js";

export default function SaleInvoiceThermal({ saleId, isOpen, onClose }) {
  const toast = useToast();
  const { getSaleById } = useSales();
  const { productsMap } = useProducts();

  const sale = getSaleById(saleId);
  if (!sale) return null;

  const receiptOptions = {
    storeName: "★ MY STORE ★",
    storeAddress: "123 Main St\nCity, State ZIP",
    storeTel: "Tel: 012-345-6789",
    taxPin: "123456789",
    cashier: "John Doe",
    paybill: "500000",
    taxRate: 0.05,
  };

  const receiptText = formatReceipt(sale, productsMap, receiptOptions);

  const handlePrint = () => {
    if (window.api?.printText) {
      window.api.printText(receiptText);
      toast({ status: "success", description: "Sent to printer" });
      return;
    }
    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (!printWindow) {
      toast({ status: "error", description: "Unable to open print window" });
      return;
    }
    printWindow.document.write(
      `<html><head><title>Receipt</title><style>body{font-family:monospace;white-space:pre;padding:20px;}</style></head><body>${receiptText}</body></html>`
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    toast({ status: "success", description: "Print dialog opened" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice - {sale.saleUuid}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
            <Text whiteSpace="pre-wrap">{receiptText}</Text>
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
