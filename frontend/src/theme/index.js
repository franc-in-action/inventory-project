// src/theme/index.js
import { extendTheme } from "@chakra-ui/react";

// Shared config for all themes
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// Glob all .js files in the options folder
const modules = import.meta.glob("./options/*.js", { eager: true });

// Convert modules to an array of { key, label, theme }
export const themes = Object.entries(modules).map(([path, mod]) => {
  const fileName = path.split("/").pop().replace(/\.js$/, "");

  const label =
    fileName.charAt(0).toUpperCase() +
    fileName
      .slice(1)
      .replace(/([A-Z])/g, " $1")
      .replace(/\bXp\b/i, "XP")
      .trim();

  return {
    key: fileName,
    label,
    theme: extendTheme({
      ...mod.default,
      config,
    }),
  };
});

// Export the first theme as default
export default themes[0]?.theme;
