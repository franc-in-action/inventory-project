import React, { createContext, useContext, useState } from "react";
import { themes } from "./index";
import { useColorMode } from "@chakra-ui/react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState(themes[0].key); // start with first theme
  const { colorMode, toggleColorMode } = useColorMode();

  // Cycle through all themes
  const toggleTheme = () => {
    const idx = themes.findIndex((t) => t.key === themeKey);
    const next = themes[(idx + 1) % themes.length];
    setThemeKey(next.key);
  };

  // Select a specific theme
  const changeTheme = (key) => setThemeKey(key);

  return (
    <ThemeContext.Provider
      value={{
        themeKey,
        theme: themes.find((t) => t.key === themeKey)?.theme,
        allThemes: themes,
        changeTheme,
        toggleTheme,
        colorMode,
        toggleColorMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeSwitcher = () => useContext(ThemeContext);
