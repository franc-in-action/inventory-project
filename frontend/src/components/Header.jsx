import {
  Box,
  Flex,
  Spacer,
  Button,
  Heading,
  IconButton,
  Text,
  ButtonGroup,
} from "@chakra-ui/react";
import { HamburgerIcon, RepeatIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { getUserFromToken, logout } from "../modules/auth/authApi.js";
import ColorModeSwitcher from "../components/ColorModeSwitcher.jsx";
import { useThemeSwitcher } from "../theme/ThemeContext"; // ✅ custom context hook

export default function Header({ onOpenSidebar, onRefresh }) {
  const navigate = useNavigate();
  const user = getUserFromToken();

  // ✅ Access the current theme and toggle function from ThemeContext
  const { themeName, toggleTheme } = useThemeSwitcher();

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

        <ButtonGroup>
          <IconButton
            aria-label="Refresh content"
            icon={<RepeatIcon />}
            onClick={onRefresh}
          />

          {/* Existing Dark/Light mode switcher */}
          <ColorModeSwitcher />

          {/* ✅ New button to toggle between Default and Windows XP themes */}
          <Button
            onClick={toggleTheme}
            title={`Current theme: ${themeName}`}
            variant="outline"
          >
            {themeName === "default" ? "Windows XP Theme" : "Default Theme"}
          </Button>

          <Button onClick={() => logout(navigate)}>Logout</Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
}
