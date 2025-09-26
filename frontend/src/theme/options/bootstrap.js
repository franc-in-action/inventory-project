/**
 * Bootstrap-like Chakra Theme
 * ---------------------------
 * Light mode: Bootstrap default colors
 * Dark mode: simple dark variant
 */

const lightColors = {
  primary: "#0d6efd",
  secondary: "#6c757d",
  success: "#198754",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#0dcaf0",
  light: "#f8f9fa",
  dark: "#212529",
  bodyBg: "#ffffff",
  bodyText: "#212529",
  border: "#dee2e6",
};

const darkColors = {
  primary: "#0d6efd",
  secondary: "#6c757d",
  success: "#198754",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#0dcaf0",
  light: "#343a40",
  dark: "#f8f9fa",
  bodyBg: "#212529",
  bodyText: "#f8f9fa",
  border: "#495057",
};

export default {
  colors: { light: lightColors, dark: darkColors },

  fonts: {
    heading: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    body: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
  },

  styles: {
    global: {
      "html, body": {
        bg: lightColors.bodyBg,
        color: lightColors.bodyText,
        _dark: { bg: darkColors.bodyBg, color: darkColors.bodyText },
        fontFamily: "body",
      },
      a: {
        color: lightColors.primary,
        textDecoration: "none",
        _hover: { textDecoration: "underline" },
        _dark: { color: darkColors.primary },
      },
    },
  },

  components: {
    Button: {
      baseStyle: {
        fontFamily: "body",
        fontWeight: "500",
        borderRadius: "0.25rem",
        border: "1px solid",
        borderColor: lightColors.border,
      },
      variants: {
        primary: {
          bg: lightColors.primary,
          color: "#fff",
          borderColor: lightColors.primary,
          _hover: { bg: "#0b5ed7" },
          _active: { bg: "#0a58ca" },
          _dark: { bg: darkColors.primary, color: "#fff" },
        },
        secondary: {
          bg: lightColors.secondary,
          color: "#fff",
          borderColor: lightColors.secondary,
          _hover: { bg: "#5c636a" },
          _active: { bg: "#4f545b" },
          _dark: { bg: darkColors.secondary, color: "#fff" },
        },
        success: {
          bg: lightColors.success,
          color: "#fff",
          borderColor: lightColors.success,
          _hover: { bg: "#157347" },
          _active: { bg: "#146c43" },
          _dark: { bg: darkColors.success, color: "#fff" },
        },
        danger: {
          bg: lightColors.danger,
          color: "#fff",
          borderColor: lightColors.danger,
          _hover: { bg: "#b02a37" },
          _active: { bg: "#842029" },
          _dark: { bg: darkColors.danger, color: "#fff" },
        },
        warning: {
          bg: lightColors.warning,
          color: "#000",
          borderColor: lightColors.warning,
          _hover: { bg: "#ffca2c" },
          _active: { bg: "#e0ac00" },
          _dark: { bg: darkColors.warning, color: "#000" },
        },
        info: {
          bg: lightColors.info,
          color: "#000",
          borderColor: lightColors.info,
          _hover: { bg: "#31d2f2" },
          _active: { bg: "#0dcaf0" },
          _dark: { bg: darkColors.info, color: "#000" },
        },
        light: {
          bg: lightColors.light,
          color: "#000",
          borderColor: lightColors.border,
          _hover: { bg: "#e2e6ea" },
          _active: { bg: "#d3d9df" },
          _dark: {
            bg: darkColors.light,
            color: "#fff",
            borderColor: darkColors.border,
          },
        },
        dark: {
          bg: lightColors.dark,
          color: "#fff",
          borderColor: "#1c1f23",
          _hover: { bg: "#1b1e21" },
          _active: { bg: "#141619" },
          _dark: {
            bg: darkColors.dark,
            color: "#000",
            borderColor: darkColors.border,
          },
        },
      },
      defaultProps: { variant: "primary" },
    },

    Card: {
      baseStyle: {
        bg: lightColors.light,
        border: "1px solid",
        borderColor: lightColors.border,
        borderRadius: "0.25rem",
        _dark: { bg: darkColors.light, borderColor: darkColors.border },
      },
    },

    Input: {
      baseStyle: {
        fontFamily: "body",
        borderRadius: "0.25rem",
        border: "1px solid",
        borderColor: lightColors.border,
        bg: "#fff",
        color: lightColors.bodyText,
        _dark: {
          bg: darkColors.light,
          borderColor: darkColors.border,
          color: darkColors.bodyText,
        },
      },
    },

    Textarea: {
      baseStyle: {
        fontFamily: "body",
        borderRadius: "0.25rem",
        border: "1px solid",
        borderColor: lightColors.border,
        bg: "#fff",
        color: lightColors.bodyText,
        _dark: {
          bg: darkColors.light,
          borderColor: darkColors.border,
          color: darkColors.bodyText,
        },
      },
    },

    Select: {
      baseStyle: {
        fontFamily: "body",
        borderRadius: "0.25rem",
        border: "1px solid",
        borderColor: lightColors.border,
        bg: "#fff",
        color: lightColors.bodyText,
        _dark: {
          bg: darkColors.light,
          borderColor: darkColors.border,
          color: darkColors.bodyText,
        },
      },
    },

    Checkbox: {
      baseStyle: {
        control: {
          border: "1px solid",
          borderColor: lightColors.border,
          bg: "#fff",
          _dark: { bg: darkColors.light, borderColor: darkColors.border },
        },
        label: {
          fontFamily: "body",
          color: lightColors.bodyText,
          _dark: { color: darkColors.bodyText },
        },
      },
    },

    Radio: {
      baseStyle: {
        control: {
          border: "1px solid",
          borderColor: lightColors.border,
          bg: "#fff",
          _dark: { bg: darkColors.light, borderColor: darkColors.border },
        },
        label: {
          fontFamily: "body",
          color: lightColors.bodyText,
          _dark: { color: darkColors.bodyText },
        },
      },
    },

    Tabs: {
      baseStyle: {
        tab: {
          borderBottom: "2px solid transparent",
          _selected: { borderColor: lightColors.primary },
          _dark: { _selected: { borderColor: darkColors.primary } },
        },
        tablist: {},
        tabpanel: {},
      },
    },

    Modal: {
      baseStyle: {
        overlay: { bg: "rgba(0,0,0,0.25)", _dark: { bg: "rgba(0,0,0,0.5)" } },
        content: {
          bg: lightColors.bodyBg,
          borderRadius: "0.25rem",
          _dark: { bg: darkColors.bodyBg },
        },
        header: {
          fontFamily: "body",
          color: lightColors.bodyText,
          _dark: { color: darkColors.bodyText },
        },
        body: { bg: lightColors.bodyBg, _dark: { bg: darkColors.bodyBg } },
        footer: { bg: lightColors.light, _dark: { bg: darkColors.light } },
      },
    },

    Text: {
      baseStyle: {
        color: lightColors.bodyText,
        _dark: { color: darkColors.bodyText },
      },
    },
    Heading: {
      baseStyle: {
        color: lightColors.bodyText,
        _dark: { color: darkColors.bodyText },
      },
    },
    Link: {
      baseStyle: {
        color: lightColors.primary,
        _dark: { color: darkColors.primary },
      },
    },
    Badge: {
      baseStyle: {
        bg: lightColors.primary,
        color: "#fff",
        _dark: { bg: darkColors.primary },
      },
    },
    Spinner: {
      baseStyle: {
        color: lightColors.primary,
        _dark: { color: darkColors.primary },
      },
    },
    Progress: {
      baseStyle: { bg: lightColors.light, _dark: { bg: darkColors.light } },
    },
  },
};
