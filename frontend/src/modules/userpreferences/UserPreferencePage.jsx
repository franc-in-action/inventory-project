import React from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Button,
  VStack,
} from "@chakra-ui/react";
import { useUserPreferences } from "../contexts/UserPreferenceContext";
import { themes } from "../../theme";

export default function UserPreferencePage() {
  const { preferences, setPreference } = useUserPreferences();

  const handleChange = (key, value) => {
    setPreference(key, value);
  };

  return (
    <Box maxW="600px" mx="auto" p={6}>
      <Heading mb={6}>User Preferences</Heading>
      <VStack spacing={4} align="stretch">
        {/* Page Size */}
        <FormControl>
          <FormLabel>Items per page</FormLabel>
          <Select
            value={preferences.pageSize}
            onChange={(e) => handleChange("pageSize", Number(e.target.value))}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Theme */}
        <FormControl>
          <FormLabel>Theme</FormLabel>
          <Select
            value={preferences.themeKey}
            onChange={(e) => handleChange("themeKey", e.target.value)}
          >
            {themes.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Default Currency */}
        <FormControl>
          <FormLabel>Default Currency</FormLabel>
          <Select
            value={preferences.defaultCurrency}
            onChange={(e) => handleChange("defaultCurrency", e.target.value)}
          >
            {["USD", "EUR", "GBP", "JPY"].map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Default Dashboard Page */}
        <FormControl>
          <FormLabel>Default Landing Page</FormLabel>
          <Select
            value={preferences.defaultDashboardPage}
            onChange={(e) =>
              handleChange("defaultDashboardPage", e.target.value)
            }
          >
            {[
              { label: "Dashboard", value: "/dashboard" },
              { label: "Sales", value: "/sales" },
              { label: "Products", value: "/products" },
              { label: "POS", value: "/pos" },
            ].map((page) => (
              <option key={page.value} value={page.value}>
                {page.label}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Compact View */}
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Compact Table View</FormLabel>
          <Switch
            isChecked={preferences.compactView}
            onChange={(e) => handleChange("compactView", e.target.checked)}
          />
        </FormControl>

        {/* Optional Save Button */}
        <Button
          colorScheme="blue"
          onClick={() => alert("Preferences saved!")}
          mt={4}
        >
          Save Preferences
        </Button>
      </VStack>
    </Box>
  );
}
