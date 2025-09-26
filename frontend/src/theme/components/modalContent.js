// src/components/modalContent.js
import { defineStyleConfig } from "@chakra-ui/react";

const ModalContent = defineStyleConfig({
  baseStyle: {
    bg: "red.100", // 🔴 light red test color
    borderRadius: "md",
    boxShadow: "lg",
    _dark: {
      bg: "red.700", // 🔴 dark mode red
    },
  },
});

export default ModalContent;
