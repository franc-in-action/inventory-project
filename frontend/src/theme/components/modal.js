// src/components/modal.js
import { modalAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  overlay: {
    bg: "blackAlpha.600",
  },
  dialog: {
    // This is the <ModalContent />
    bg: "red.100", // 🔴 light red for testing
    borderRadius: "md",
    boxShadow: "lg",
    _dark: { bg: "red.700" },
  },
  header: {
    fontWeight: "bold",
    fontSize: "lg",
  },
  body: { fontSize: "md" },
  footer: {
    borderTop: "1px solid",
    borderColor: "gray.200",
  },
});

// 👈 add defaultProps so the `bg` prop isn’t set to "white"
export default defineMultiStyleConfig({
  baseStyle,
  defaultProps: {
    // this forces Chakra to use our theme values instead of its own
    variant: null,
    size: null,
  },
});
