import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import App from "./App.jsx";
import "./index.css";

const theme = extendTheme({
  components: {
    Tabs: {
      baseStyle: {
        tab: {
          border: "none",
          _hover: { bg: "transparent" },
          _selected: { border: "none", bg: "transparent" },
          _focus: { boxShadow: "none" },
        },
      },
    },
    Button: {
      // ⬇️ All <Button> components will now use these styles by default
      baseStyle: {
        appearance: "none",
        bg: "#FAFBFC",
        border: "1px solid rgba(27,31,35,0.15)",
        borderRadius: "6px",
        boxShadow:
          "rgba(27,31,35,0.04) 0 1px 0, rgba(255,255,255,0.25) 0 1px 0 inset",
        color: "#24292E",
        cursor: "pointer",
        fontFamily:
          '-apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        fontSize: "14px",
        fontWeight: "500",
        lineHeight: "20px",
        px: "16px",
        py: "6px",
        transition: "background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1)",
        _hover: {
          bg: "#F3F4F6",
          textDecoration: "none",
          transitionDuration: "0.1s",
        },
        _active: {
          bg: "#EDEFF2",
          boxShadow: "rgba(225,228,232,0.2) 0 1px 0 inset",
          transition: "none 0s",
        },
        _disabled: {
          bg: "#FAFBFC",
          borderColor: "rgba(27,31,35,0.15)",
          color: "#959DA5",
          cursor: "default",
          opacity: 1, // prevents Chakra's default fade
        },
        _focus: {
          outline: "1px transparent",
          boxShadow: "none",
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config?.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
