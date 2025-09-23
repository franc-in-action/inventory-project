// src/modules/admin/ExportModal.jsx
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
import { adminApi } from "./adminApi.js";

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
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Export Data</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={3}>
            <Button
              colorScheme="blue"
              onClick={() => handleExport("products")}
              isLoading={loading}
            >
              Export Products
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => handleExport("sales")}
              isLoading={loading}
            >
              Export Sales
            </Button>
            <Button
              colorScheme="purple"
              onClick={() => handleExport("purchases")}
              isLoading={loading}
            >
              Export Purchases
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
