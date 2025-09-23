import {
  Text,
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  VStack,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { getUserFromToken, userHasRole } from "../modules/auth/authApi.js";
import { PERMISSIONS } from "../constants/permissions.js";

export default function Sidebar({ isOpen, onOpen, onClose }) {
  const user = getUserFromToken();
  const userRole = user?.role?.toLowerCase();

  // Build links dynamically based on role
  const links = [
    { to: "/dashboard", label: "Dashboard", roles: PERMISSIONS.DASHBOARD },
    { to: "/products", label: "Products", roles: PERMISSIONS.PRODUCTS },
    { to: "/sales", label: "Sales", roles: PERMISSIONS.SALES },
    { to: "/purchases", label: "Purchases", roles: PERMISSIONS.PURCHASES },
    { to: "/locations", label: "Locations", roles: PERMISSIONS.LOCATIONS },
    {
      to: "/admin-tools",
      label: "Admin Tools",
      roles: PERMISSIONS.ADMIN_TOOLS,
    },
  ].filter((link) => userHasRole(link.roles));

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
        {user?.location && (
          <Text fontSize="sm" color="gray.400">
            {user.location}
          </Text>
        )}
        {user && (
          <Text fontSize="sm" color="gray.400">
            {user.name} ({user.role})
          </Text>
        )}

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
