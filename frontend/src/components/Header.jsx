import {
  Box,
  Flex,
  Spacer,
  Button,
  Heading,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { getUserFromToken, logout } from "../modules/auth/authApi.js";

export default function Header({ onOpenSidebar }) {
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

        <Heading size={{ base: "sm", md: "md" }}>Inventory App</Heading>

        <Spacer />

        {user && (
          <Text fontSize="sm" color="gray.400">
            {user.name} ({user.role})
          </Text>
        )}
        {user?.location && (
          <Text fontSize="sm" color="gray.400">
            {user.location} {/* Show location first */}
          </Text>
        )}

        <Button
          size={{ base: "sm", md: "md" }}
          colorScheme="red"
          onClick={() => logout(navigate)}
        >
          Logout
        </Button>
      </Flex>
    </Box>
  );
}
