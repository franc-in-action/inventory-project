/**
 * Windows XP Classic Reset Theme
 * -------------------------------
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

export default {
  colors: { light, dark },

  fonts: {
    heading: `'Tahoma', sans-serif`,
    body: `'Tahoma', sans-serif`,
  },

  styles: {
    global: {
      ":root": {
        "--sans-serif": '"Pixelated MS Sans Serif", Arial',

        // Windows XP palette
        "--surface": "#ece9d8",
        "--button-face": "#dfdfdf",
        "--button-highlight": "#ffffff",
        "--button-shadow": "#808080",
        "--window-frame": "#0a0a0a",
        "--dialog-blue": "#2267cb",

        // Input
        "--input-border-color": "#789dbc",

        // Scrollbar
        "--scrollbar-bg":
          "linear-gradient(90deg, rgba(197, 213, 255, 1) 0%, rgba(181, 211, 255, 1) 86%, rgba(182, 202, 247, 1) 100%)",
        "--scrollbar-shadow":
          "inset 1px 1px white, inset -1px -1px white, inset 2px 2px #b9cdfa, inset -2px -2px #b6c9f7",
      },
    },
  },

  components: {
    Box: {
      baseStyle: {
        bg: "var(--surface)",
        border: "1px solid",
        borderColor: "var(--window-frame)",
        _dark: { bg: dark.xpGray, borderColor: dark.xpDark },
      },
    },

    Flex: { baseStyle: { bg: "transparent" } },
    VStack: { baseStyle: { bg: "transparent" } },
    HStack: { baseStyle: { bg: "transparent" } },
    Spacer: {},

    Card: {
      baseStyle: { bg: "var(--surface)", borderRadius: "0", border: "none" },
    },

    Button: {
      baseStyle: {
        fontFamily: "var(--sans-serif)",
        fontSize: "11px",
        fontWeight: "normal",
        borderRadius: "0",
        border: "1px solid var(--window-frame)",
        bg: "var(--button-face)",
        color: "var(--xpText)",
        _dark: {
          bg: dark.xpGray,
          borderColor: dark.xpDark,
          color: dark.xpText,
        },
      },
    },

    Input: {
      baseStyle: {
        fontFamily: "var(--sans-serif)",
        borderRadius: "0",
        border: "1px solid var(--input-border-color)",
        bg: "white",
        _dark: {
          bg: dark.xpLight,
          borderColor: dark.xpDark,
          color: dark.xpText,
        },
      },
    },

    Textarea: {
      baseStyle: {
        fontFamily: "var(--sans-serif)",
        borderRadius: "0",
        border: "1px solid var(--input-border-color)",
        bg: "white",
        _dark: {
          bg: dark.xpLight,
          borderColor: dark.xpDark,
          color: dark.xpText,
        },
      },
    },

    Select: {
      baseStyle: {
        fontFamily: "var(--sans-serif)",
        borderRadius: "0",
        border: "1px solid var(--input-border-color)",
        bg: "white",
        _dark: {
          bg: dark.xpLight,
          borderColor: dark.xpDark,
          color: dark.xpText,
        },
      },
    },

    Checkbox: {
      baseStyle: {
        control: {
          border: "1px solid var(--window-frame)",
          bg: "white",
          _dark: { bg: dark.xpLight, borderColor: dark.xpDark },
        },
        label: {
          fontFamily: "var(--sans-serif)",
          color: "var(--xpText)",
          _dark: { color: dark.xpText },
        },
      },
    },

    Radio: {
      baseStyle: {
        control: {
          border: "1px solid var(--window-frame)",
          bg: "white",
          _dark: { bg: dark.xpLight, borderColor: dark.xpDark },
        },
        label: {
          fontFamily: "var(--sans-serif)",
          color: "var(--xpText)",
          _dark: { color: dark.xpText },
        },
      },
    },

    Tabs: {
      baseStyle: {
        tab: {
          bg: "var(--button-face)",
          border: "1px solid var(--window-frame)",
          _dark: { bg: dark.xpGray },
        },
        tablist: { bg: "var(--surface)", _dark: { bg: dark.xpGray } },
        tabpanel: { bg: "var(--surface)", _dark: { bg: dark.xpGray } },
      },
    },

    Modal: {
      baseStyle: {
        overlay: { bg: "rgba(0,0,0,0.25)", _dark: { bg: "rgba(0,0,0,0.4)" } },
        content: {
          bg: "var(--surface)",
          border: "1px solid var(--window-frame)",
          _dark: { bg: dark.xpGray, borderColor: dark.xpDark },
        },
        header: {
          fontFamily: "var(--sans-serif)",
          color: "var(--xpText)",
          _dark: { color: dark.xpText },
        },
        body: { bg: "var(--surface)", _dark: { bg: dark.xpGray } },
        footer: { bg: "var(--button-face)", _dark: { bg: dark.xpLight } },
      },
    },

    Text: {
      baseStyle: { color: "var(--xpText)", _dark: { color: dark.xpText } },
    },
    Heading: {
      baseStyle: {
        color: "var(--xpText)",
        fontWeight: "bold",
        _dark: { color: dark.xpText },
      },
    },
    Link: {
      baseStyle: { color: "var(--xpBlue)", _dark: { color: dark.xpBlue } },
    },
    Badge: {
      baseStyle: {
        bg: "var(--xpBlue)",
        color: "white",
        _dark: { bg: dark.xpBlue },
      },
    },
    Spinner: {
      baseStyle: { color: "var(--xpBlue)", _dark: { color: dark.xpBlue } },
    },
    Progress: {
      baseStyle: { bg: "var(--surface)", _dark: { bg: dark.xpGray } },
    },
  },
};
