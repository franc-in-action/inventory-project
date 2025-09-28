import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import Heatmap from "./Heatmap.jsx";

export default function HeatmapModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button colorScheme="green" onClick={onOpen}>
        Heatmap
      </Button>

      <Modal size="6xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customer Activity Heatmap (1 Year)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Heatmap />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
