import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { CloseBtn } from "../../../components/Xp.jsx"; // import your custom CloseBtn

import { adminApi } from "../adminApi.js";

export default function BackupModal({ isOpen, onClose }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await adminApi.triggerBackup();
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
      console.error(err);
      toast({ title: "Failed to create backup", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await adminApi.restoreBackup(file);
      if (data.ok) {
        toast({ title: "Backup restored successfully", status: "success" });
        setFile(null);
      } else {
        throw new Error(data.error || "Restore failed");
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to restore backup", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Backup & Restore</ModalHeader>
        <CloseBtn onClick={onClose} />
        <ModalBody>
          <VStack>
            <Button onClick={handleBackup} isLoading={loading}>
              Create Backup
            </Button>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".json"
            />
            <Button
              onClick={handleRestore}
              isLoading={loading}
              disabled={!file}
            >
              Restore Backup
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
