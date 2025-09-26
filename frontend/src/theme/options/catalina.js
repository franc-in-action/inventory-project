/**
 * macOS Catalina palette
 * ----------------------
 * Light mode: macOS light gray + blue accents
 * Dark mode: macOS dark gray + vibrant blue accents
 */

const light = {
  macBlue: "#007AFF",
  macGray: "#E5E5E5",
  macLight: "#F5F5F7",
  macDark: "#B0B0B0",
  macText: "#1D1D1F",
};

const dark = {
  macBlue: "#0A84FF",
  macGray: "#1C1C1E",
  macLight: "#2C2C2E",
  macDark: "#3A3A3C",
  macText: "#F5F5F7",
};

export default {
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
    xl: "1440px",
    "2xl": "1920px",
  },

  colors: { light, dark },

  fonts: {
    heading: `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  },

  styles: {
    global: {
      "html, body": {
        bg: light.macGray,
        color: light.macText,
        _dark: { bg: dark.macGray, color: dark.macText },
        transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
      },
    },
  },

  components: {
    Box: {
      baseStyle: {
        bg: light.macGray,
        border: "1px solid",
        borderColor: light.macDark,
        borderRadius: "8px",
        _dark: { bg: dark.macGray, borderColor: dark.macDark },
      },
    },

    Card: {
      baseStyle: {
        bg: light.macLight,
        border: "1px solid",
        borderColor: light.macDark,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        p: 4,
        _dark: {
          bg: dark.macLight,
          borderColor: dark.macDark,
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        },
      },
    },

    Button: {
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "6px",
        bg: light.macBlue,
        color: "white",
        _hover: { bg: "#005FCC" },
        _active: { bg: "#004A99" },
        _dark: {
          bg: dark.macBlue,
          _hover: { bg: "#006AD9" },
          _active: { bg: "#0050A6" },
        },
      },
      sizes: {
        sm: { fontSize: "sm", px: 3, py: 2 },
        md: { fontSize: "md", px: 4, py: 2 },
        lg: { fontSize: "lg", px: 6, py: 3 },
      },
      defaultProps: { size: "md" },
    },

    Tabs: {
      baseStyle: {
        tab: {
          fontWeight: "medium",
          bg: "transparent",
          borderBottom: "2px solid transparent",
          _selected: {
            color: light.macBlue,
            borderColor: light.macBlue,
          },
          _dark: {
            _selected: {
              color: dark.macBlue,
              borderColor: dark.macBlue,
            },
          },
        },
        tablist: {
          borderBottom: "1px solid",
          borderColor: light.macDark,
          _dark: { borderColor: dark.macDark },
        },
      },
    },

    Table: {
      baseStyle: {
        th: {
          bg: light.macLight,
          borderBottom: "1px solid",
          borderColor: light.macDark,
          fontWeight: "semibold",
          _dark: { bg: dark.macLight, borderColor: dark.macDark },
        },
        td: {
          borderBottom: "1px solid",
          borderColor: light.macDark,
          _dark: { borderColor: dark.macDark },
        },
      },
    },

    Modal: {
      baseStyle: {
        dialog: {
          bg: light.macLight,
          borderRadius: "12px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          _dark: {
            bg: dark.macLight,
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          },
        },
        header: { fontWeight: "semibold", px: 4, py: 3 },
        footer: { bg: "transparent", px: 4, py: 3 },
      },
    },

    Input: {
      baseStyle: {
        field: {
          borderRadius: "6px",
          border: "1px solid",
          borderColor: light.macDark,
          bg: "white",
          _focus: {
            borderColor: light.macBlue,
            boxShadow: "0 0 0 1px #007AFF",
          },
          _dark: {
            borderColor: dark.macDark,
            bg: dark.macLight,
            _focus: {
              borderColor: dark.macBlue,
              boxShadow: "0 0 0 1px #0A84FF",
            },
          },
        },
      },
    },

    Text: {
      baseStyle: {
        color: light.macText,
        fontSize: { base: "14px", md: "16px" },
        _dark: { color: dark.macText },
      },
    },

    Heading: {
      baseStyle: {
        fontWeight: "bold",
        color: light.macText,
        _dark: { color: dark.macText },
      },
    },

    Link: {
      baseStyle: {
        color: light.macBlue,
        _hover: { textDecoration: "underline" },
        _dark: { color: dark.macBlue },
      },
    },

    Badge: {
      baseStyle: {
        bg: light.macBlue,
        color: "white",
        borderRadius: "12px",
        px: 2,
        py: 0.5,
        _dark: { bg: dark.macBlue },
      },
    },
  },
};
