import { extendTheme } from "@chakra-ui/react";
import windowsXp from "./windowsXp"; // ✅ Import the Windows XP theme you created

// -----------------
// Base (default) theme
// -----------------
const config = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const baseTheme = extendTheme({
  config,
  // 👇 If you want a minimal brand color you can leave or remove this
  colors: {
    brand: {
      500: "#1E88E5", // optional primary blue
    },
  },
});

// -----------------
// Export both themes for switching
// -----------------
export const themes = {
  default: baseTheme,
  windowsXp: windowsXp,
};

// You can still export the default if you want a single default import
export default baseTheme;
