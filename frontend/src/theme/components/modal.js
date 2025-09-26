// src/components/modal.js
const Modal = {
  baseStyle: {
    dialog: {
      // Styles for the <ModalContent />
      borderRadius: "md",
      bg: "white",
      boxShadow: "lg",
      _dark: {
        bg: "gray.800",
      },
    },
    header: {
      // Styles for <ModalHeader />
      fontWeight: "bold",
      fontSize: "lg",
      borderBottom: "1px solid",
      borderColor: "gray.200",
      _dark: {
        borderColor: "gray.700",
      },
    },
    body: {
      // Styles for <ModalBody />
      fontSize: "md",
      color: "gray.700",
      _dark: {
        color: "gray.200",
      },
    },
    footer: {
      // Styles for <ModalFooter />
      borderTop: "1px solid",
      borderColor: "gray.200",
      _dark: {
        borderColor: "gray.700",
      },
    },
    overlay: {
      // Styles for the backdrop
      bg: "blackAlpha.600",
    },
  },
  sizes: {
    md: {
      dialog: {
        maxW: "500px",
      },
    },
    lg: {
      dialog: {
        maxW: "800px",
      },
    },
  },
  variants: {
    rounded: {
      dialog: {
        borderRadius: "xl",
      },
    },
  },
  defaultProps: {
    size: "md",
    variant: "rounded",
  },
};

export default Modal;
