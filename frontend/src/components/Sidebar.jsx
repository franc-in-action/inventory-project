import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  VStack,
  Text,
  Icon,
  Divider,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { getUserFromToken, userHasRole } from "../modules/auth/authApi.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  FaUsers,
  FaTachometerAlt,
  FaBox,
  FaCashRegister,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaTools,
  FaTruck,
} from "react-icons/fa";

export default function Sidebar({ isOpen, onClose }) {
  const user = getUserFromToken();

  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: FaTachometerAlt,
      roles: PERMISSIONS.DASHBOARD,
    },
    {
      to: "/products",
      label: "Products",
      icon: FaBox,
      roles: PERMISSIONS.PRODUCTS,
    },
    {
      to: "/sales",
      label: "Sales",
      icon: FaCashRegister,
      roles: PERMISSIONS.SALES,
    },
    {
      to: "/purchases",
      label: "Purchases",
      icon: FaShoppingCart,
      roles: PERMISSIONS.PURCHASES,
    },
    {
      to: "/locations",
      label: "Locations",
      icon: FaMapMarkerAlt,
      roles: PERMISSIONS.LOCATIONS,
    },
    {
      to: "/customers",
      label: "Customers",
      icon: FaUsers, // added
      roles: PERMISSIONS.CUSTOMERS,
    },
    {
      to: "/vendors",
      label: "Vendors",
      icon: FaTruck,
      roles: PERMISSIONS.VENDORS,
    }, // added
    {
      to: "/admin-tools",
      label: "Admin Tools",
      icon: FaTools,
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
      zIndex={20}
    >
      {user && (
        <Box mb={6} textAlign="center">
          {user.location && (
            <Text fontSize="sm" color="gray.400">
              {user.location}
            </Text>
          )}
          <Text fontWeight="bold">{user.name}</Text>
          <Text fontSize="sm" color="gray.400">
            {user.role}
          </Text>
        </Box>
      )}
      <Divider borderColor="gray.700" mb={4} />
      <VStack spacing={2} align="stretch">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              fontWeight: isActive ? "bold" : "normal",
              backgroundColor: isActive ? "#2D3748" : "transparent",
              color: isActive ? "#63B3ED" : "#A0AEC0",
            })}
            onClick={onClose}
          >
            <Icon as={link.icon} w={5} h={5} />
            {link.label}
          </NavLink>
        ))}
      </VStack>
    </Box>
  );

  return (
    <>
      <Box display={{ base: "none", md: "block" }}>{SidebarContent}</Box>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>{SidebarContent}</DrawerContent>
      </Drawer>
    </>
  );
}
