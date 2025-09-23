import {
  Box,
  Flex,
  Spacer,
  Button,
  Heading,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

export default function Header({ onOpenSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }} boxShadow="sm">
      <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
        {/* Mobile Hamburger: visible only on small screens */}
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

        <Button
          size={{ base: "sm", md: "md" }}
          colorScheme="red"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Flex>
    </Box>
  );
}
