import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import App from "./App.jsx";
import { ThemeProvider, useThemeSwitcher } from "./theme/ThemeContext";

function Root() {
  const { theme } = useThemeSwitcher();

  return (
    <>
      <ColorModeScript initialColorMode={theme.config?.initialColorMode} />
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </React.StrictMode>
);
