// src/modules/admin/LogDetailModal.jsx
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
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { adminApi } from "./adminApi.js";

export default function LogDetailModal({ logId, isOpen, onClose }) {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !logId) return;

    setLoading(true);
    (async () => {
      try {
        const res = await adminApi.getLogById(logId);
        setLog(res.data);
      } catch (err) {
        console.error("[LogDetailModal] Failed to fetch log:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [logId, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Log Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner size="xl" margin="auto" />
          ) : log ? (
            <VStack spacing={3} align="start">
              <Text>
                <strong>ID:</strong> {log.id}
              </Text>
              <Text>
                <strong>User:</strong> {log.userName}
              </Text>
              <Text>
                <strong>Action:</strong> {log.action}
              </Text>
              <Text>
                <strong>Timestamp:</strong>{" "}
                {new Date(log.createdAt).toLocaleString()}
              </Text>
              <Text>
                <strong>Details:</strong>
              </Text>
              <Text pl={4}>{log.details}</Text>
            </VStack>
          ) : (
            <Text>No log details found.</Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
