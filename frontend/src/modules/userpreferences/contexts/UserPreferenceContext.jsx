import React, { createContext, useContext, useState, useEffect } from "react";

const UserPreferenceContext = createContext();

export function UserPreferenceProvider({ children }) {
  const [preferences, setPreferences] = useState({
    themeKey: "default", // current theme key
    pageSize: 10,
    defaultCurrency: "USD",
    compactView: false,
  });

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("userPreferences");
    if (stored) {
      try {
        setPreferences((prev) => ({ ...prev, ...JSON.parse(stored) }));
      } catch (err) {
        console.warn("Failed to parse user preferences", err);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
  }, [preferences]);

  const setPreference = (key, value) =>
    setPreferences((prev) => ({ ...prev, [key]: value }));

  return (
    <UserPreferenceContext.Provider value={{ preferences, setPreference }}>
      {children}
    </UserPreferenceContext.Provider>
  );
}

export function useUserPreferences() {
  return useContext(UserPreferenceContext);
}
