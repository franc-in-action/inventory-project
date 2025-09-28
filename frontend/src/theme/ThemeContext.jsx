import React, { createContext, useContext, useState, useEffect } from "react";
import { themes } from "./index";
import { useColorMode } from "@chakra-ui/react";

const ThemeContext = createContext();
const LOCAL_STORAGE_KEY = "selectedThemeKey";

export const ThemeProvider = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const [themeKey, setThemeKey] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved || themes[0].key;
  });

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, themeKey);
  }, [themeKey]);

  const changeTheme = (key) => setThemeKey(key);

  const toggleTheme = () => {
    const idx = themes.findIndex((t) => t.key === themeKey);
    const next = themes[(idx + 1) % themes.length];
    setThemeKey(next.key);
  };

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
