import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import App from "./App.jsx";
import "./index.css";

// --- Optional: extend the default theme if you need custom breakpoints ---
const theme = extendTheme({
  // Default Chakra breakpoints are already mobile-first:
  // base, sm, md, lg, xl, 2xl
  // You can override or add more if needed:
  // breakpoints: {
  //   sm: "30em",
  //   md: "48em",
  //   lg: "62em",
  //   xl: "80em",
  //   "2xl": "96em",
  // },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Ensures color mode + breakpoints are loaded before the app renders */}
    <ColorModeScript initialColorMode={theme.config?.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
