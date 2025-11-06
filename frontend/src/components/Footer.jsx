// src/components/Footer.jsx
import {
  Box,
  Flex,
  Button,
  Select,
  IconButton,
  ButtonGroup,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon, UnlockIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { logout } from "../modules/auth/authApi";
import { useThemeSwitcher } from "../theme/ThemeContext";
import { useUserPreferences } from "../modules/userpreferences/contexts/UserPreferenceContext";

export default function Footer() {
  const navigate = useNavigate();
  const { themeKey, allThemes, changeTheme, colorMode, toggleColorMode } =
    useThemeSwitcher();
  const { setPreference } = useUserPreferences();

  const handleThemeChange = (key) => {
    changeTheme(key);
    setPreference?.("themeKey", key);
  };

  return (
    <Box
      as="footer"
      px={{ base: 4, md: 6 }}
      py={{ base: 3, md: 4 }}
      boxShadow="inner"
      borderTopWidth="1px"
      mt="auto"
    >
      <Flex
        justify="flex-end"
        align="center"
        wrap="wrap"
        gap={3}
        direction={{ base: "column", md: "row" }}
      >
        <ButtonGroup alignItems="center" gap={2}>
          <Button
            onClick={toggleColorMode}
            variant="outline"
            leftIcon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            title={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
          >
            {colorMode === "light" ? "Dark" : "Light"}
          </Button>

          <Select
            value={themeKey}
            onChange={(e) => handleThemeChange(e.target.value)}
            width="auto"
            minW="150px"
            title="Select theme"
          >
            {allThemes?.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>

          <Button
            colorScheme="red"
            onClick={() => logout(navigate)}
            leftIcon={<UnlockIcon />}
            title="Logout"
          >
            Logout
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
}
