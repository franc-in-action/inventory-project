import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  VStack,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ links, isOpen, onOpen, onClose }) {
  const SidebarContent = (
    <Box
      as="nav"
      bg="gray.800"
      color="white"
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      p={4}
    >
      <VStack spacing={4} align="stretch">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#2D3748" : "transparent",
              borderRadius: "6px",
              padding: "8px 12px",
              fontWeight: isActive ? "bold" : "normal",
            })}
            onClick={onClose}
          >
            {link.label}
          </NavLink>
        ))}
      </VStack>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box display={{ base: "none", md: "block" }}>{SidebarContent}</Box>

      {/* Mobile Drawer Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>{SidebarContent}</DrawerContent>
      </Drawer>
    </>
  );
}
