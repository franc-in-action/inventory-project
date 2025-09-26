// frontend/src/theme/windowsXp.js
import { extendTheme } from "@chakra-ui/react";

/**
 * Windows XP classic palette
 * --------------------------
 * Classic Blue: #0054E3
 * Silver/Gray window: #C0C0C0
 * Light highlight: #E0E0E0
 * Dark border: #808080
 * Text dark: #000000
 */
const colors = {
  xpBlue: "#0054E3",
  xpGray: "#C0C0C0",
  xpLight: "#E0E0E0",
  xpDark: "#808080",
  xpText: "#000000",
};

const windowsXp = extendTheme({
  colors,
  fonts: {
    heading: `'Tahoma', sans-serif`,
    body: `'Tahoma', sans-serif`,
  },
  styles: {
    global: {
      "html, body": {
        bg: colors.xpGray,
        color: colors.xpText,
      },
    },
  },

  components: {
    Box: {
      baseStyle: {
        bg: colors.xpGray,
        border: "1px solid",
        borderColor: colors.xpDark,
      },
    },
    Flex: { baseStyle: { bg: "transparent" } },
    VStack: { baseStyle: { bg: "transparent" } },
    HStack: { baseStyle: { bg: "transparent" } },
    Spacer: {},

    Card: {
      baseStyle: {
        bg: colors.xpLight,
        border: "2px solid",
        borderColor: colors.xpDark,
        borderRadius: "4px",
        boxShadow: "inset 1px 1px #fff, inset -1px -1px #404040",
        p: 4,
      },
    },

    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "2px",
        border: "2px outset",
        borderColor: colors.xpLight,
        bg: colors.xpLight,
        color: colors.xpText,
        _hover: { bg: "#FFFFFF" },
        _active: {
          border: "2px inset",
          bg: "#D0D0D0",
        },
      },
      variants: {
        solid: {},
        outline: {
          border: "2px groove",
        },
      },
    },
    IconButton: { baseStyle: { variant: "solid" } },
    ButtonGroup: {},

    Tabs: {
      baseStyle: {
        tab: {
          bg: colors.xpLight,
          border: "1px solid",
          borderColor: colors.xpDark,
          borderBottom: "none",
          _selected: {
            bg: "#FFFFFF",
            borderColor: colors.xpDark,
          },
        },
        tablist: {
          borderBottom: "1px solid",
          borderColor: colors.xpDark,
          bg: colors.xpGray,
        },
        tabpanel: {
          bg: "#FFFFFF",
          border: "1px solid",
          borderColor: colors.xpDark,
          p: 4,
        },
      },
    },
    TabList: {},
    TabPanels: {},
    Tab: {},
    TabPanel: {},

    Table: {
      baseStyle: {
        table: {
          borderCollapse: "collapse",
        },
        th: {
          bg: colors.xpLight,
          border: "1px solid",
          borderColor: colors.xpDark,
          fontWeight: "bold",
          px: 2,
          py: 1,
        },
        td: {
          border: "1px solid",
          borderColor: colors.xpDark,
          px: 2,
          py: 1,
        },
      },
    },
    Thead: {},
    Tbody: {},
    Tr: {},
    Th: {},
    Td: {},
    Tfoot: {},

    Spinner: {
      baseStyle: {
        color: colors.xpBlue,
      },
    },
    useToast: {},

    Modal: {
      baseStyle: {
        dialog: {
          bg: colors.xpLight,
          border: "2px solid",
          borderColor: colors.xpDark,
          boxShadow: "2px 2px #404040",
        },
        header: {
          bg: colors.xpBlue,
          color: "white",
          fontWeight: "bold",
          px: 4,
          py: 2,
        },
        overlay: {
          bg: "rgba(0,0,0,0.3)",
        },
        footer: {
          bg: colors.xpGray,
        },
      },
    },
    ModalOverlay: {},
    ModalContent: {},
    ModalHeader: {},
    ModalBody: {},
    ModalFooter: {},
    ModalCloseButton: {},

    FormControl: {},
    FormLabel: { baseStyle: { fontWeight: "bold" } },
    Input: {
      baseStyle: {
        border: "2px inset",
        borderColor: colors.xpDark,
        bg: "#FFFFFF",
        _focus: {
          borderColor: colors.xpBlue,
          boxShadow: "none",
        },
      },
    },
    Select: {
      baseStyle: {
        border: "2px inset",
        borderColor: colors.xpDark,
        bg: "#FFFFFF",
      },
    },
    Textarea: {
      baseStyle: {
        border: "2px inset",
        borderColor: colors.xpDark,
        bg: "#FFFFFF",
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          border: "2px outset",
          borderColor: colors.xpDark,
          bg: "#FFFFFF",
        },
      },
    },
    Radio: {
      baseStyle: {
        control: {
          border: "2px outset",
          borderColor: colors.xpDark,
          bg: "#FFFFFF",
        },
      },
    },

    Text: {
      baseStyle: {
        color: colors.xpText,
        fontSize: "14px",
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: "bold",
        color: colors.xpText,
      },
    },
    Link: {
      baseStyle: {
        color: colors.xpBlue,
        textDecoration: "underline",
        _hover: { color: "#003399" },
      },
    },
    Badge: {
      baseStyle: {
        bg: colors.xpBlue,
        color: "white",
        borderRadius: "2px",
        px: 2,
      },
    },
  },
});

export default windowsXp;
