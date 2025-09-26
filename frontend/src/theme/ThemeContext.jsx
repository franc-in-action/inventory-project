import React, { createContext, useContext, useState } from "react";
import { themes } from "./index";
import { useColorMode } from "@chakra-ui/react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // ✅ Start with default theme
  const [themeName, setThemeName] = useState("default");
  const { colorMode, toggleColorMode } = useColorMode();

  // 🔹 Keep old toggle function (optional)
  const toggleTheme = () => {
    setThemeName((prev) =>
      prev === "default"
        ? "windowsXp"
        : prev === "windowsXp"
        ? "catalina"
        : "default"
    );
  };

  // 🔹 New: select theme directly from dropdown
  const changeTheme = (name) => setThemeName(name);

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        theme: themes[themeName],
        toggleTheme, // keep old toggle for buttons if needed
        changeTheme, // new setter for dropdown
        colorMode,
        toggleColorMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeSwitcher = () => useContext(ThemeContext);
