import {
  Box,
  Flex,
  Spacer,
  Button,
  Heading,
  IconButton,
  Text,
  ButtonGroup,
  Select,
} from "@chakra-ui/react";
import { HamburgerIcon, RepeatIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { getUserFromToken, logout } from "../modules/auth/authApi.js";
import { useThemeSwitcher } from "../theme/ThemeContext";

export default function Header({ onOpenSidebar, onRefresh }) {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const { themeKey, allThemes, changeTheme, colorMode, toggleColorMode } =
    useThemeSwitcher();

  return (
    <Box px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }} boxShadow="sm">
      <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
        <IconButton
          display={{ base: "flex", md: "none" }}
          icon={<HamburgerIcon />}
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        />

        <Heading>Inventory App</Heading>

        <Spacer />

        {user && (
          <Text>
            {user.name} ({user.role})
          </Text>
        )}
        {user?.location && <Text>{user.location}</Text>}

        <ButtonGroup alignItems="center" gap={2}>
          <IconButton
            aria-label="Refresh content"
            icon={<RepeatIcon />}
            onClick={onRefresh}
          />

          {/* 🌗 Dark/Light Mode Toggle */}
          <Button
            onClick={toggleColorMode}
            variant="outline"
            title={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
          >
            {colorMode === "light" ? "Dark Mode" : "Light Mode"}
          </Button>

          {/* 💻 Dynamic Theme Selector Dropdown */}
          <Select
            value={themeKey}
            onChange={(e) => changeTheme(e.target.value)}
            width="auto"
            minW="180px"
            title="Select theme"
          >
            {allThemes.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>

          <Button onClick={() => logout(navigate)}>Logout</Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
}
