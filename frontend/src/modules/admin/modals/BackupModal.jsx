// src/modules/admin/BackupModal.jsx
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
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { adminApi } from "../adminApi.js";

export default function BackupModal({ isOpen, onClose }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await adminApi.triggerBackup();

      // Convert response blob to download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: "Backup created and downloaded", status: "success" });
    } catch (err) {
      toast({ title: "Failed to create backup", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await adminApi.restoreBackup(file);
      toast({ title: "Backup restored", status: "success" });
      setFile(null);
    } catch (err) {
      toast({ title: "Failed to restore backup", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Backup & Restore</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Button
              colorScheme="yellow"
              onClick={handleBackup}
              isLoading={loading}
            >
              Create Backup
            </Button>
            <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <Button
              colorScheme="green"
              onClick={handleRestore}
              isLoading={loading}
              disabled={!file}
            >
              Restore Backup
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
