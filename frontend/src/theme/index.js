import { extendTheme } from "@chakra-ui/react";
import windowsXp from "./windowsXp";
import catalina from "./catalina"; // ✅ import the new theme

// -------------
// Shared config
// -------------
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// -------------
// Default theme
// -------------
const baseTheme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#1E88E5",
      600: "#1976d2",
      700: "#1565c0",
      800: "#0d47a1",
      900: "#0b3c91",
    },
  },
});

// -------------
// Windows XP + Catalina themes
// -------------
const windowsXpTheme = extendTheme({ ...windowsXp, config });
const catalinaTheme = extendTheme({ ...catalina, config }); // ✅

export const themes = {
  default: baseTheme,
  windowsXp: windowsXpTheme,
  catalina: catalinaTheme, // ✅ add to exported list
};

export default baseTheme;
