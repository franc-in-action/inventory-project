import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  VStack,
  Text,
  Icon,
  Divider,
  Collapse,
  Button,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
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
  FaMoneyBillWave,
  FaWarehouse,
} from "react-icons/fa";

export default function Sidebar({ isOpen, onClose }) {
  const user = getUserFromToken();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const links = [
    {
      label: "Dashboard",
      icon: FaTachometerAlt,
      roles: PERMISSIONS.DASHBOARD,
      to: "/dashboard",
    },
    {
      label: "Inventory",
      icon: FaBox,
      roles: [
        PERMISSIONS.PRODUCTS,
        PERMISSIONS.STOCK,
        PERMISSIONS.PURCHASES,
        PERMISSIONS.VENDORS,
        PERMISSIONS.STOCK_ADJUSTMENTS,
      ],
      submenu: [
        { to: "/products", label: "Products", roles: PERMISSIONS.PRODUCTS },
        { to: "/stock", label: "Stock", roles: PERMISSIONS.STOCK },
        {
          to: "/stock-adjustments",
          label: "Adjustments",
          roles: PERMISSIONS.STOCK_ADJUSTMENTS,
        },
        { to: "/purchases", label: "Purchases", roles: PERMISSIONS.PURCHASES },
        { to: "/vendors", label: "Vendors", roles: PERMISSIONS.VENDORS },
      ],
    },
    {
      label: "Sales",
      icon: FaCashRegister,
      roles: [PERMISSIONS.SALES, PERMISSIONS.CUSTOMERS, PERMISSIONS.PAYMENTS],
      submenu: [
        { to: "/sales", label: "Invoices", roles: PERMISSIONS.SALES },
        { to: "/customers", label: "Customers", roles: PERMISSIONS.CUSTOMERS },
        { to: "/payments", label: "Payments", roles: PERMISSIONS.PAYMENTS },
      ],
    },
    {
      label: "Accounts",
      icon: FaUsers,
      roles: [PERMISSIONS.CUSTOMERS, PERMISSIONS.PAYMENTS],
      submenu: [
        { to: "/customers", label: "Customers", roles: PERMISSIONS.CUSTOMERS },
        { to: "/payments", label: "Payments", roles: PERMISSIONS.PAYMENTS },
      ],
    },
    {
      label: "Manage",
      icon: FaTools,
      roles: [PERMISSIONS.LOCATIONS, PERMISSIONS.ADMIN_TOOLS],
      submenu: [
        { to: "/locations", label: "Locations", roles: PERMISSIONS.LOCATIONS },
        {
          to: "/admin-tools",
          label: "Admin Tools",
          roles: PERMISSIONS.ADMIN_TOOLS,
        },
      ],
    },
  ].filter((link) => {
    if (link.submenu) {
      link.submenu = link.submenu.filter((sub) => userHasRole(sub.roles));
      return link.submenu.length > 0;
    }
    return userHasRole(link.roles);
  });

  const SidebarContent = (
    <Box
      as="nav"
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      p={4}
      zIndex={20}
      overflowY="auto"
    >
      {user && (
        <Box mb={6} p={4}>
          {user.location && <Text fontSize="sm">{user.location}</Text>}
          <Text fontWeight="bold">{user.name}</Text>
          <Text fontSize="sm">{user.role}</Text>
        </Box>
      )}
      <Divider mb={4} />
      <VStack spacing={2} align="stretch">
        {links.map((link) => (
          <Box key={link.label}>
            {!link.submenu ? (
              <NavLink
                to={link.to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontWeight: isActive ? "bold" : "normal",
                })}
                onClick={onClose}
              >
                <Icon as={link.icon} w={5} h={5} />
                {link.label}
              </NavLink>
            ) : (
              <Box>
                <Button
                  justifyContent="space-between"
                  w="full"
                  onClick={() => toggleMenu(link.label)}
                  leftIcon={<Icon as={link.icon} w={5} h={5} />}
                >
                  <Text flex="1" textAlign="left">
                    {link.label}
                  </Text>
                  <Text>{openMenu === link.label ? "▲" : "▼"}</Text>
                </Button>

                <Collapse in={openMenu === link.label} animateOpacity>
                  <VStack pl={6} align="stretch" spacing={1}>
                    {link.submenu.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        style={({ isActive }) => ({
                          display: "block",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontWeight: isActive ? "bold" : "normal",
                        })}
                        onClick={onClose}
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </VStack>
                </Collapse>
              </Box>
            )}
          </Box>
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
