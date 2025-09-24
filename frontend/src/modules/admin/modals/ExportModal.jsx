import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
} from "@chakra-ui/react";
import { adminApi } from "../adminApi.js";

export default function ExportModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (type) => {
    setLoading(true);
    try {
      const blob = await adminApi.exportData(type, {});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.xlsx`;
      a.click();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Export Data</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
            <Button
              onClick={() => handleExport("products")}
              isLoading={loading}
            >
              Export Products
            </Button>
            <Button onClick={() => handleExport("sales")} isLoading={loading}>
              Export Sales
            </Button>
            <Button
              onClick={() => handleExport("purchases")}
              isLoading={loading}
            >
              Export Purchases
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
