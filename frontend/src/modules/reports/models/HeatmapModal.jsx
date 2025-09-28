import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import CloseBtn from "../../components/CloseBtn.jsx"; // import your custom CloseBtn

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
          <CloseBtn onClick={onClose} />
          <ModalBody>
            <Heatmap />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
