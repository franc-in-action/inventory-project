import React, { createContext, useContext, useState } from "react";
import { themes } from "./index"; // your themes object with { default, windowsXp }

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState("default");
  const toggleTheme = () =>
    setThemeName((prev) => (prev === "default" ? "windowsXp" : "default"));

  return (
    <ThemeContext.Provider
      value={{ themeName, theme: themes[themeName], toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeSwitcher = () => useContext(ThemeContext);
