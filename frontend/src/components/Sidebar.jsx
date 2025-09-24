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
  FaTachometerAlt,
  FaBox,
  FaCashRegister,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaTools,
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
      to: "/admin-tools",
      label: "Admin Tools",
      icon: FaTools,
      roles: PERMISSIONS.ADMIN_TOOLS,
    },
  ].filter((link) => userHasRole(link.roles));

  const SidebarContent = (
    <Box as="nav">
      {user && (
        <Box>
          {user.location && <Text>{user.location}</Text>}
          <Text>{user.name}</Text>
          <Text>{user.role}</Text>
        </Box>
      )}
      <Divider />
      <VStack>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={onClose}>
            <Icon as={link.icon} />
            {link.label}
          </NavLink>
        ))}
      </VStack>
    </Box>
  );

  return (
    <>
      <Box>{SidebarContent}</Box>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>{SidebarContent}</DrawerContent>
      </Drawer>
    </>
  );
}
