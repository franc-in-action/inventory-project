import {
  Box,
  Flex,
  Spacer,
  Button,
  Heading,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon, RepeatIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { getUserFromToken, logout } from "../modules/auth/authApi.js";

export default function Header({ onOpenSidebar, onRefresh }) {
  const navigate = useNavigate();
  const user = getUserFromToken();

  return (
    <Box>
      <Flex>
        {/* Mobile Hamburger */}
        <IconButton
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

        {/* Refresh Button */}
        <IconButton
          aria-label="Refresh content"
          icon={<RepeatIcon />}
          onClick={onRefresh}
        />

        <Button onClick={() => logout(navigate)}>Logout</Button>
      </Flex>
    </Box>
  );
}
