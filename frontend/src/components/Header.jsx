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
import { HamburgerIcon, RepeatIcon } from "@chakra-ui/icons"; // Add RepeatIcon
import { useNavigate } from "react-router-dom";
import { getUserFromToken, logout } from "../modules/auth/authApi.js";
import ColorModeSwitcher from "../components/ColorModeSwitcher.jsx";

export default function Header({ onOpenSidebar, onRefresh }) {
  const navigate = useNavigate();
  const user = getUserFromToken();

  return (
    <Box px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }} boxShadow="sm">
      <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
        {/* Mobile Hamburger */}
        <IconButton
          display={{ base: "flex", md: "none" }}
          icon={<HamburgerIcon />}
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          variant="outline"
          mr={2}
        />

        <Heading>Inventory App</Heading>

        <Spacer />

        {user && (
          <Text fontSize="sm" color="gray.400">
            {user.name} ({user.role})
          </Text>
        )}
        {user?.location && (
          <Text fontSize="sm" color="gray.400">
            {user.location}
          </Text>
        )}

        <ButtonGroup>
          {/* Refresh Button */}
          <IconButton
            aria-label="Refresh content"
            icon={<RepeatIcon />}
            // size={{ base: "sm", md: "md" }}
            colorScheme="blue"
            onClick={onRefresh}
          />

          <ColorModeSwitcher />

          <Button
            // size={{ base: "sm", md: "md" }}
            colorScheme="red"
            onClick={() => logout(navigate)}
          >
            Logout
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
}
