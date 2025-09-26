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

export default {
  colors: { light, dark },

  fonts: {
    heading: `'Tahoma', sans-serif`,
    body: `'Tahoma', sans-serif`,
  },

  styles: {
    global: {
      ":root": {
        // Font
        "--sans-serif": '"Pixelated MS Sans Serif", Arial',

        // Colors
        "--surface": "#ece9d8",
        "--button-highlight": "#ffffff",
        "--button-face": "#dfdfdf",
        "--button-shadow": "#808080",
        "--window-frame": "#0a0a0a",
        "--dialog-blue": "#2267cb",

        // Borders
        "--input-border-color": "#789dbc",

        // Scrollbar
        "--scrollbar-bg":
          "linear-gradient(90deg, rgba(197, 213, 255, 1) 0%, rgba(181, 211, 255, 1) 86%, rgba(182, 202, 247, 1) 100%)",
        "--scrollbar-shadow":
          "inset 1px 1px white, inset -1px -1px white, inset 2px 2px #b9cdfa, inset -2px -2px #b6c9f7",
      },
      "::-webkit-scrollbar": {
        width: "17px",
        height: "17px",
      },
      "::-webkit-scrollbar-corner": {
        background: "var(--button-face)",
      },
      "::-webkit-scrollbar-track": {
        "&:vertical": {
          backgroundImage: "url('./icon/scroll-background.svg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        },
        "&:horizontal": {
          backgroundImage: "url('./icon/scroll-background-horizontal.svg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        },
      },
      "::-webkit-scrollbar-thumb": {
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#c8d6fb",
        backgroundSize: "7px",
        border: "1px solid white",
        borderRadius: "2px",
        boxShadow: "inset -3px 0 #bad1fc, inset 1px 1px #b7caf5",
        "&:vertical": {
          backgroundImage: "url('./icon/scroll-thumb.svg')",
        },
        "&:horizontal": {
          backgroundSize: "8px",
          backgroundImage: "url('./icon/scroll-thumb-horizontal.svg')",
        },
      },
      "::-webkit-scrollbar-button": {
        "&:vertical": {
          "&:start": {
            height: "17px",
            backgroundImage: "url('./icon/scroll-arrow-up.svg')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          },
          "&:end": {
            height: "17px",
            backgroundImage: "url('./icon/scroll-arrow-down.svg')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          },
        },
        "&:horizontal": {
          "&:start": {
            width: "17px",
            backgroundImage: "url('./icon/scroll-arrow-left.svg')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          },
          "&:end": {
            width: "17px",
            backgroundImage: "url('./icon/scroll-arrow-right.svg')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          },
          "@keyframes sliding": {
            "0%": { transform: "translateX(-30px)" },
            "100%": { transform: "translateX(100%)" },
          },
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
        _dark: { bg: dark.xpGray, borderColor: dark.xpDark },
      },
    },
    Flex: { baseStyle: { bg: "transparent" } },
    VStack: { baseStyle: { bg: "transparent" } },
    HStack: { baseStyle: { bg: "transparent" } },
    Spacer: {},

    Card: {
      baseStyle: {
        bg: light.xpLight, // main tile color
        border: "2px solid",
        borderColor: light.xpDark, // darker border for 3D effect
        borderRadius: "2px", // slightly sharper corners like XP
        p: 4,
        boxShadow: "inset 2px 2px #ffffff, inset -2px -2px #808080", // classic XP bevel
        _hover: {
          bg: light.xpBlue, // highlight color on hover
          boxShadow: "inset 1px 1px #ffffff, inset -1px -1px #606060",
          cursor: "pointer",
        },
        _dark: {
          bg: dark.xpLight,
          borderColor: dark.xpDark,
          boxShadow: "inset 2px 2px #2a2a2a, inset -2px -2px #000000",
          _hover: {
            bg: dark.xpBlue,
            boxShadow: "inset 1px 1px #3a3a3a, inset -1px -1px #000000",
            cursor: "pointer",
          },
        },
      },
    },

    Button: {
      baseStyle: {
        fontFamily: "var(--sans-serif)",
        fontSize: "11px",
        fontWeight: "bold",
        boxSizing: "border-box",
        borderRadius: "3px",
        border: "1px solid #003c74",
        bg: "linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(236, 235, 229, 1) 86%, rgba(216, 208, 196, 1) 100%)",
        boxShadow: "none",
        px: 3,
        py: 1,
        _hover: {
          boxShadow:
            "inset -1px 1px #fff0cf, inset 1px 2px #fdd889, inset -2px 2px #fbc761, inset 2px -2px #e5a01a",
          cursor: "pointer",
        },
        _active: {
          bg: "linear-gradient(180deg, rgba(205, 202, 195, 1) 0%, rgba(227, 227, 219, 1) 8%, rgba(229, 229, 222, 1) 94%, rgba(242, 242, 241, 1) 100%)",
          boxShadow: "none",
        },
        _focus: {
          boxShadow:
            "inset -1px 1px #cee7ff, inset 1px 2px #98b8ea, inset -2px 2px #bcd4f6, inset 1px -1px #89ade4, inset 2px -2px #89ade4",
        },
        _dark: {
          border: "1px solid #003c74",
          bg: "linear-gradient(180deg, #3a3a3a 0%, #2c2c2c 100%)",
          color: "#ddd",
          _hover: {
            boxShadow:
              "inset -1px 1px #555, inset 1px 2px #666, inset -2px 2px #444, inset 2px -2px #333",
          },
          _active: {
            bg: "linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%)",
            boxShadow: "none",
          },
          _focus: {
            boxShadow:
              "inset -1px 1px #667, inset 1px 2px #444, inset -2px 2px #555, inset 1px -1px #333, inset 2px -2px #222",
          },
        },
      },
    },

    IconButton: {
      baseStyle: {
        fontFamily: "var(--sans-serif)",
        fontSize: "11px",
        fontWeight: "bold",
        boxSizing: "border-box",
        borderRadius: "3px",
        border: "1px solid #003c74",
        bg: "linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(236, 235, 229, 1) 86%, rgba(216, 208, 196, 1) 100%)",
        boxShadow: "none",
        _hover: {
          boxShadow:
            "inset -1px 1px #fff0cf, inset 1px 2px #fdd889, inset -2px 2px #fbc761, inset 2px -2px #e5a01a",
          cursor: "pointer",
        },
        _active: {
          bg: "linear-gradient(180deg, rgba(205, 202, 195, 1) 0%, rgba(227, 227, 219, 1) 8%, rgba(229, 229, 222, 1) 94%, rgba(242, 242, 241, 1) 100%)",
          boxShadow: "none",
        },
        _focus: {
          boxShadow:
            "inset -1px 1px #cee7ff, inset 1px 2px #98b8ea, inset -2px 2px #bcd4f6, inset 1px -1px #89ade4, inset 2px -2px #89ade4",
        },
        _dark: {
          border: "1px solid #003c74",
          bg: "linear-gradient(180deg, #3a3a3a 0%, #2c2c2c 100%)",
          color: "#ddd",
          _hover: {
            boxShadow:
              "inset -1px 1px #555, inset 1px 2px #666, inset -2px 2px #444, inset 2px -2px #333",
          },
          _active: {
            bg: "linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%)",
            boxShadow: "none",
          },
          _focus: {
            boxShadow:
              "inset -1px 1px #667, inset 1px 2px #444, inset -2px 2px #555, inset 1px -1px #333, inset 2px -2px #222",
          },
        },
      },
    },

    Tabs: {
      baseStyle: {
        tab: {
          bg: "linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(250, 250, 249, 1) 26%, rgba(240, 240, 234, 1) 95%, rgba(236, 235, 229, 1) 100%)",
          border: "1px solid #91a7b4",
          borderTopRadius: "3px",
          borderBottom: "none",
          px: 3,
          py: 1,
          marginRight: "2px",
          marginLeft: "-1px",
          borderRadius: 0,
          _hover: {
            borderTop: "1px solid #e68b2c",
            boxShadow: "inset 0px 2px #ffc73c",
            cursor: "pointer",
          },
          _selected: {
            bg: "#fcfcfe",
            borderColor: "#919b9c",
            borderTop: "1px solid #e68b2c",
            borderBottom: "1px solid transparent",
            marginRight: "-1px",
            boxShadow: "inset 0px 2px #ffc73c",
            _first: {
              _before: {
                content: '""',
                display: "block",
                position: "absolute",
                zIndex: -1,
                top: "100%",
                left: "-1px",
                height: "2px",
                width: "0",
                borderLeft: "1px solid #919b9c",
              },
            },
          },
          _dark: {
            bg: "linear-gradient(180deg, #444 0%, #3a3a3a 100%)",
            borderColor: "#666",
            _hover: {
              bg: "#555",
            },
            _selected: {
              bg: "#3a3a3a",
              borderColor: "#666",
              boxShadow: "inset 0px 2px #999",
            },
          },
        },
        tablist: {
          bg: "#f8f8f8",
          borderBottom: "1px solid #91a7b4",
          p: 1,
          _dark: {
            bg: "#2c2c2c",
            borderColor: "#666",
          },
        },
        tabpanel: {
          bg: "#fcfcfe",
          boxShadow:
            "inset 1px 1px #fcfcfe, inset -1px -1px #fcfcfe, 1px 2px 2px 0px rgba(208, 206, 191, 0.75)",
          p: 3,
          _dark: {
            bg: "#2c2c2c",
            boxShadow:
              "inset 1px 1px #3a3a3a, inset -1px -1px #3a3a3a, 1px 2px 2px 0px rgba(50, 50, 50, 0.75)",
          },
        },
      },
    },

    Table: {
      baseStyle: {
        table: {
          borderCollapse: "collapse", // classic Excel look
          width: "100%",
        },
        th: {
          bg: light.xpLight, // light XP-style header
          border: "1px solid",
          borderColor: light.xpDark, // subtle dark border
          fontWeight: "bold",
          textAlign: "left",
          px: 2, // compact padding
          py: 1,
          _dark: {
            bg: dark.xpLight,
            borderColor: dark.xpDark,
          },
        },
        td: {
          border: "1px solid",
          borderColor: light.xpDark, // subtle grid lines
          px: 2,
          py: 1,
          _dark: {
            borderColor: dark.xpDark,
          },
        },
        tfoot: {
          fontWeight: "bold",
          bg: light.xpLight,
          _dark: {
            bg: dark.xpLight,
          },
        },
      },
    },

    List: {
      baseStyle: {
        fontFamily: "var(--sans-serif)",
        WebkitFontSmoothing: "auto",
        border: "1px solid #7f9db9",
        padding: "2px 5px",
        borderRadius: "2px",
        listStyleType: "none",
        _dark: {
          borderColor: "#4a4a4a",
        },
      },
    },

    UnorderedList: {
      baseStyle: {
        fontFamily: "var(--sans-serif)",
        WebkitFontSmoothing: "auto",
        border: "1px solid #7f9db9",
        padding: "2px 5px",
        borderRadius: "2px",
        listStyleType: "disc",
        _dark: {
          borderColor: "#4a4a4a",
        },
      },
    },

    Modal: {
      baseStyle: {
        overlay: {
          bg: "rgba(0,0,0,0.25)",
          _dark: { bg: "rgba(0,0,0,0.4)" },
        },
        content: {
          bg: light.surface,
          border: "1px solid #7f9db9",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          boxShadow:
            "inset -1px -1px #00138c, inset 1px 1px #0831d9, inset -2px -2px #001ea0, inset 2px 2px #166aee, inset -3px -3px #003bda, inset 3px 3px #0855dd",
          paddingBottom: "3px",
          WebkitFontSmoothing: "antialiased",
          h: "400px", // moderate fixed height
          _dark: {
            bg: dark.surface,
            borderColor: dark.xpDark,
            boxShadow:
              "inset -1px -1px #000080, inset 1px 1px #0000aa, inset -2px -2px #0000cc, inset 2px 2px #2222ee, inset -3px -3px #0000dd, inset 3px 3px #1111ff",
          },
        },
        header: {
          fontFamily: "Trebuchet MS",
          bg: "linear-gradient(180deg, rgba(9, 151, 255, 1) 0%, rgba(0, 83, 238, 1) 8%, rgba(0, 80, 238, 1) 40%, rgba(0, 102, 255, 1) 88%, rgba(0, 102, 255, 1) 93%, rgba(0, 91, 255, 1) 95%, rgba(0, 61, 215, 1) 96%, rgba(0, 61, 215, 1) 100%)",
          color: "white",
          fontWeight: "bold",
          fontSize: "13px",
          px: 4,
          py: 2,
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "7px",
          textShadow: "1px 1px #0f1089",
          height: "28px",
          _dark: { bg: dark.xpBlue },
        },
        closeButton: {
          color: "white",
          bg: "#0050ee",
          minW: "21px",
          minH: "21px",
          ml: "2px",
          bgPos: "center",
          bgRepeat: "no-repeat",
          boxShadow: "none",
          border: "none",
          _hover: { bg: "#0050ee" },
          _active: { bg: "#0050ee", boxShadow: "none" },
          _focus: { boxShadow: "none" },
          _dark: { color: "white", bg: dark.xpBlue },
        },
        body: {
          px: 4,
          py: 3,
          bg: light.surface,
          _dark: { bg: dark.surface },
        },
        footer: {
          bg: light.buttonFace,
          px: 4,
          py: 2,
          borderTop: "1px solid",
          borderColor: light.xpDark,
          borderBottomRadius: "4px",
          _dark: { bg: dark.buttonFace, borderColor: dark.xpDark },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: "bold",
        color: light.xpText,
        _dark: { color: dark.xpText },
        fontFamily: "var(--sans-serif)",
        WebkitFontSmoothing: "antialiased",
      },
    },

    Input: {
      baseStyle: {
        border: "1px solid #7f9db9",
        borderRadius: "2px",
        bg: "#FFFFFF",
        height: "23px",
        fontFamily: "var(--sans-serif)",
        WebkitFontSmoothing: "antialiased",
        _focus: {
          borderColor: light.xpBlue,
          boxShadow: "inset 2px 2px white, inset -2px -2px white",
        },
        _dark: {
          borderColor: dark.xpDark,
          bg: dark.xpLight,
          _focus: { borderColor: dark.xpBlue },
        },
        _selection: { bg: "var(--dialog-blue)", color: "white" },
      },
    },

    Select: {
      baseStyle: {
        fontFamily: '"Pixelated MS Sans Serif", Arial',
        fontSize: "11px",
        border: "none",
        borderRadius: "0",
        bg: "#fff",
        boxSizing: "border-box",
        height: "21px",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        position: "relative",
        px: 1,
        pr: "32px", // leave space for arrow
        py: "3px",
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='17' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15 0H0v16h1V1h14V0z' fill='%23DFDFDF'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M2 1H1v14h1V2h12V1H2z' fill='%23fff'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M16 17H0v-1h15V0h1v17z' fill='%23000'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15 1h-1v14H1v1h14V1z' fill='gray'/%3E%3Cpath fill='silver' d='M2 2h12v13H2z'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M11 6H4v1h1v1h1v1h1v1h1V9h1V8h1V7h1V6z' fill='%23000'/%3E%3C/svg%3E\")",
        backgroundPosition: "top 2px right 2px",
        backgroundRepeat: "no-repeat",
        _focus: {
          outline: "none",
          color: "#fff",
          bg: "#2267cb",
          option: { color: "#000", bg: "#fff" },
        },
        _active: {
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='17' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h16v17H0V0zm1 16h14V1H1v15z' fill='gray'/%3E%3Cpath fill='silver' d='M1 1h14v15H1z'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 7H5v1h1v1h1v1h1v1h1v-1h1V9h1V8h1V7z' fill='%23000'/%3E%3C/svg%3E\")",
        },
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
        fontFamily: "var(--sans-serif)",
        WebkitFontSmoothing: "antialiased",
        _dark: { borderColor: dark.xpDark, bg: dark.xpLight },
        _selection: { bg: "var(--dialog-blue)", color: "white" },
      },
    },

    Checkbox: {
      baseStyle: {
        control: {
          w: "13px",
          h: "13px",
          border: "1px solid #1d5281",
          borderRadius: "2px",
          bg: "#FFFFFF",
          position: "relative",
          _hover: {
            boxShadow: "inset -2px -2px #f8b636, inset 2px 2px #fedf9c",
          },
          _checked: {
            bgImage: "url('./icon/checkmark.svg')",
            bgRepeat: "no-repeat",
            bgPos: "center",
          },
          _disabled: {
            borderColor: "#cac8bb",
            bg: "#FFFFFF",
            _checked: { bgImage: "url('./icon/checkmark-disabled.svg')" },
          },
          _dark: { borderColor: dark.xpDark, bg: dark.xpLight },
        },
        label: {
          ml: 2,
          fontFamily: "var(--sans-serif)",
          WebkitFontSmoothing: "antialiased",
        },
      },
    },

    Radio: {
      baseStyle: {
        control: {
          w: "13px",
          h: "13px",
          border: "1px solid #1d5281",
          borderRadius: "50%",
          bg: "linear-gradient(135deg, rgba(220, 220, 215, 1) 0%, rgba(255, 255, 255, 1) 100%)",
          position: "relative",
          _hover: {
            boxShadow: "inset -2px -2px #f8b636, inset 2px 2px #fedf9c",
          },
          _checked: {
            bgImage: "url('./icon/radio-dot.svg')",
            bgRepeat: "no-repeat",
            bgPos: "center",
          },
          _active: {
            bg: "linear-gradient(135deg, rgba(176, 176, 167, 1) 0%, rgba(227, 225, 210, 1) 100%)",
          },
          _disabled: {
            borderColor: "#cac8bb",
            bg: "#FFFFFF",
            _checked: { bgImage: "url('./icon/radio-dot-disabled.svg')" },
          },
          _dark: { borderColor: dark.xpDark, bg: dark.xpLight },
        },
        label: {
          ml: 2,
          fontFamily: "var(--sans-serif)",
          WebkitFontSmoothing: "antialiased",
        },
      },
    },

    Slider: {
      baseStyle: {
        track: {
          bg: "#ecebe4",
          borderRadius: "2px",
          borderRight: "1px solid #f3f2ea",
          borderBottom: "1px solid #f3f2ea",
          boxShadow:
            "1px 0 0 white, 1px 1px 0 white, 0 1px 0 white, -1px 0 0 #9d9c99, -1px -1px 0 #9d9c99, 0 -1px 0 #9d9c99, -1px 1px 0 white, 1px -1px #9d9c99",
        },
        thumb: {
          w: "11px",
          h: "21px",
          bgImage: "url('./icon/indicator-horizontal.svg')",
          transform: "translateY(-8px)",
          _focus: { boxShadow: "none" },
        },
        _vertical: {
          track: {
            borderLeft: "1px solid #f3f2ea",
            borderRight: "0",
            borderBottom: "1px solid #f3f2ea",
            boxShadow:
              "-1px 0 0 white, -1px 1px 0 white, 0 1px 0 white, 1px 0 0 #9d9c99, 1px -1px 0 #9d9c99, 0 -1px 0 #9d9c99, 1px 1px 0 white, -1px -1px #9d9c99",
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
        _dark: { color: dark.xpBlue, _hover: { color: "#5AA0E5" } },
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

    Spinner: {
      baseStyle: { color: light.xpBlue, _dark: { color: dark.xpBlue } },
    },

    Progress: {
      baseStyle: {
        track: {
          border: "1px solid #686868",
          borderRadius: "4px",
          bg: "#fff",
          boxShadow: "inset 0 0 1px 0 rgba(104, 104, 104, 1)",
          overflow: "hidden",
          height: "14px",
        },
        filledTrack: {
          borderRadius: "2px",
          bgImage:
            "repeating-linear-gradient(to right, #fff 0px, #fff 2px, transparent 2px, transparent 10px), linear-gradient(to bottom, #acedad 0%, #7be47d 14%, #4cda50 28%, #2ed330 42%, #42d845 57%, #76e275 71%, #8fe791 85%, #ffffff 100%)",
          animation: "sliding 2s linear infinite",
        },
        _indeterminate: {
          filledTrack: {
            bgImage:
              "repeating-linear-gradient(to right, transparent 0px, transparent 8px, #fff 8px, #fff 10px, transparent 10px, transparent 18px, #fff 18px, #fff 20px, transparent 20px, transparent 28px, #fff 28px, #fff 100%), linear-gradient(to bottom, #acedad 0%, #7be47d 14%, #4cda50 28%, #2ed330 42%, #42d845 57%, #76e275 71%, #8fe791 85%, #ffffff 100%)",
            animation: "sliding 2s linear infinite",
          },
        },
        _dark: {
          track: { bg: "#2c2c2c", borderColor: "#444" },
          filledTrack: {
            bgImage:
              "repeating-linear-gradient(to right, #555 0px, #555 2px, transparent 2px, transparent 10px), linear-gradient(to bottom, #3a3a3a 0%, #4a4a4a 14%, #5a5a5a 28%, #6a6a6a 42%, #7a7a7a 57%, #8a8a8a 71%, #9a9a9a 85%, #ffffff 100%)",
          },
        },
      },
      defaultProps: {
        size: "md",
      },
    },
  },
};
