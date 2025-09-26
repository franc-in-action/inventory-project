import { extendTheme } from "@chakra-ui/react";

/**
 * Windows XP classic palette
 * --------------------------
 * Light mode: original XP colors
 * Dark mode: “midnight XP” variant
 */
const light = {
  xpBlue: "#0054E3",
  xpGray: "#C0C0C0",
  xpLight: "#E0E0E0",
  xpDark: "#808080",
  xpText: "#000000",
};

const dark = {
  xpBlue: "#3A6EA5",
  xpGray: "#1e1e1e",
  xpLight: "#2c2c2c",
  xpDark: "#555555",
  xpText: "#E0E0E0",
};

const windowsXp = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: true,
  },

  colors: {
    light,
    dark,
  },

  fonts: {
    heading: `'Tahoma', sans-serif`,
    body: `'Tahoma', sans-serif`,
  },

  styles: {
    global: {
      "html, body": {
        bg: light.xpGray,
        color: light.xpText,
        _dark: {
          bg: dark.xpGray,
          color: dark.xpText,
        },
      },
    },
  },

  components: {
    Box: {
      baseStyle: {
        bg: light.xpGray,
        border: "1px solid",
        borderColor: light.xpDark,
        _dark: {
          bg: dark.xpGray,
          borderColor: dark.xpDark,
        },
      },
    },
    Flex: { baseStyle: { bg: "transparent" } },
    VStack: { baseStyle: { bg: "transparent" } },
    HStack: { baseStyle: { bg: "transparent" } },
    Spacer: {},

    Card: {
      baseStyle: {
        bg: light.xpLight,
        border: "2px solid",
        borderColor: light.xpDark,
        borderRadius: "4px",
        boxShadow: "inset 1px 1px #fff, inset -1px -1px #404040",
        p: 4,
        _dark: {
          bg: dark.xpLight,
          borderColor: dark.xpDark,
          boxShadow: "inset 1px 1px #2a2a2a, inset -1px -1px #000",
        },
      },
    },

    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "2px",
        border: "2px outset",
        borderColor: light.xpLight,
        bg: light.xpLight,
        color: light.xpText,
        _hover: { bg: "#FFFFFF" },
        _active: {
          border: "2px inset",
          bg: "#D0D0D0",
        },
        _dark: {
          borderColor: dark.xpLight,
          bg: dark.xpLight,
          color: dark.xpText,
          _hover: { bg: "#3a3a3a" },
          _active: { bg: "#2a2a2a" },
        },
      },
    },
    IconButton: { baseStyle: { variant: "solid" } },

    Tabs: {
      baseStyle: {
        tab: {
          bg: light.xpLight,
          border: "1px solid",
          borderColor: light.xpDark,
          borderBottom: "none",
          _selected: {
            bg: "#FFFFFF",
            borderColor: light.xpDark,
          },
          _dark: {
            bg: dark.xpLight,
            borderColor: dark.xpDark,
            _selected: {
              bg: "#3a3a3a",
              borderColor: dark.xpDark,
            },
          },
        },
        tablist: {
          borderBottom: "1px solid",
          borderColor: light.xpDark,
          bg: light.xpGray,
          _dark: {
            borderColor: dark.xpDark,
            bg: dark.xpGray,
          },
        },
        tabpanel: {
          bg: "#FFFFFF",
          border: "1px solid",
          borderColor: light.xpDark,
          p: 4,
          _dark: {
            bg: "#2c2c2c",
            borderColor: dark.xpDark,
          },
        },
      },
    },

    Table: {
      baseStyle: {
        table: { borderCollapse: "collapse" },
        th: {
          bg: light.xpLight,
          border: "1px solid",
          borderColor: light.xpDark,
          fontWeight: "bold",
          px: 2,
          py: 1,
          _dark: {
            bg: dark.xpLight,
            borderColor: dark.xpDark,
          },
        },
        td: {
          border: "1px solid",
          borderColor: light.xpDark,
          px: 2,
          py: 1,
          _dark: {
            borderColor: dark.xpDark,
          },
        },
      },
    },

    Spinner: {
      baseStyle: {
        color: light.xpBlue,
        _dark: { color: dark.xpBlue },
      },
    },

    Modal: {
      baseStyle: {
        dialog: {
          bg: light.xpLight,
          border: "2px solid",
          borderColor: light.xpDark,
          boxShadow: "2px 2px #404040",
          _dark: {
            bg: dark.xpLight,
            borderColor: dark.xpDark,
            boxShadow: "2px 2px #000",
          },
        },
        header: {
          bg: light.xpBlue,
          color: "white",
          fontWeight: "bold",
          px: 4,
          py: 2,
          _dark: {
            bg: dark.xpBlue,
          },
        },
        overlay: { bg: "rgba(0,0,0,0.3)" },
        footer: {
          bg: light.xpGray,
          _dark: { bg: dark.xpGray },
        },
      },
    },

    FormLabel: {
      baseStyle: {
        fontWeight: "bold",
        color: light.xpText,
        _dark: { color: dark.xpText },
      },
    },
    Input: {
      baseStyle: {
        border: "2px inset",
        borderColor: light.xpDark,
        bg: "#FFFFFF",
        _focus: { borderColor: light.xpBlue, boxShadow: "none" },
        _dark: {
          borderColor: dark.xpDark,
          bg: dark.xpLight,
          _focus: { borderColor: dark.xpBlue },
        },
      },
    },
    Select: {
      baseStyle: {
        border: "2px inset",
        borderColor: light.xpDark,
        bg: "#FFFFFF",
        _dark: {
          borderColor: dark.xpDark,
          bg: dark.xpLight,
        },
      },
    },
    Textarea: {
      baseStyle: {
        border: "2px inset",
        borderColor: light.xpDark,
        bg: "#FFFFFF",
        _dark: {
          borderColor: dark.xpDark,
          bg: dark.xpLight,
        },
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          border: "2px outset",
          borderColor: light.xpDark,
          bg: "#FFFFFF",
          _dark: {
            borderColor: dark.xpDark,
            bg: dark.xpLight,
          },
        },
      },
    },
    Radio: {
      baseStyle: {
        control: {
          border: "2px outset",
          borderColor: light.xpDark,
          bg: "#FFFFFF",
          _dark: {
            borderColor: dark.xpDark,
            bg: dark.xpLight,
          },
        },
      },
    },

    Text: {
      baseStyle: {
        color: light.xpText,
        fontSize: "14px",
        _dark: { color: dark.xpText },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: "bold",
        color: light.xpText,
        _dark: { color: dark.xpText },
      },
    },
    Link: {
      baseStyle: {
        color: light.xpBlue,
        textDecoration: "underline",
        _hover: { color: "#003399" },
        _dark: {
          color: dark.xpBlue,
          _hover: { color: "#5AA0E5" },
        },
      },
    },
    Badge: {
      baseStyle: {
        bg: light.xpBlue,
        color: "white",
        borderRadius: "2px",
        px: 2,
        _dark: { bg: dark.xpBlue },
      },
    },
  },
});

export default windowsXp;
