/**
 * Chakra UI Default Theme
 * -----------------------
 * Standard Chakra UI component styles
 */

import { extendTheme } from "@chakra-ui/react";

const chakraTheme = extendTheme({
  styles: {
    global: {
      "html, body": {
        color: "gray.800",
        bg: "white",
        lineHeight: "tall",
        fontFamily: "system-ui, sans-serif",
        _dark: {
          color: "whiteAlpha.900",
          bg: "gray.800",
        },
      },
    },
  },

  colors: {
    // Chakra default colors
    gray: {
      50: "#F7FAFC",
      100: "#EDF2F7",
      200: "#E2E8F0",
      300: "#CBD5E0",
      400: "#A0AEC0",
      500: "#718096",
      600: "#4A5568",
      700: "#2D3748",
      800: "#1A202C",
      900: "#171923",
    },
    red: {
      50: "#FFF5F5",
      100: "#FED7D7",
      200: "#FEB2B2",
      300: "#FC8181",
      400: "#F56565",
      500: "#E53E3E",
      600: "#C53030",
      700: "#9B2C2C",
      800: "#822727",
      900: "#63171B",
    },
    // Other default Chakra colors remain here...
  },

  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
    mono: "Menlo, monospace",
  },

  components: {
    Button: {
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "md",
      },
      sizes: {
        md: {
          px: 4,
          py: 2,
        },
      },
      variants: {
        solid: {},
        outline: {},
        ghost: {},
        link: {},
      },
    },

    Input: {
      baseStyle: {},
      sizes: {
        md: {
          field: {
            borderRadius: "md",
          },
        },
      },
      variants: {
        outline: {},
        filled: {},
        flushed: {},
        unstyled: {},
      },
    },

    Textarea: {
      baseStyle: {},
    },

    Select: {
      baseStyle: {},
    },

    Checkbox: {
      baseStyle: {},
    },

    Radio: {
      baseStyle: {},
    },

    Tabs: {
      baseStyle: {},
    },

    Modal: {
      baseStyle: {},
    },

    Text: {},
    Heading: {},
    Link: {},
    Badge: {},
    Spinner: {},
    Progress: {},
    Box: {},
    Flex: {},
    VStack: {},
    HStack: {},
    Spacer: {},
  },
});

export default chakraTheme;
