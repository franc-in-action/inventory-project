import React, { createContext, useContext, useState, useEffect } from "react";
import { themes } from "./index";
import { useColorMode } from "@chakra-ui/react";

const ThemeContext = createContext();

const LOCAL_STORAGE_KEY = "selectedThemeKey";

export const ThemeProvider = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  // Load the saved theme from localStorage or fallback to first theme
  const [themeKey, setThemeKey] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved || themes[0].key;
  });

  // Save themeKey to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, themeKey);
  }, [themeKey]);

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
