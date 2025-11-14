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
  Link,
  IconButton,
  Flex,
  Tooltip,
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
  FaTools,
  FaChartBar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function Sidebar({ isOpen, onClose }) {
  const user = getUserFromToken();
  const [openMenu, setOpenMenu] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const handleMenuClick = (link) => {
    if (isCollapsed) {
      // Expand first
      setIsCollapsed(false);

      // After expansion, open submenu (if it exists)
      if (link.submenu) {
        setTimeout(() => {
          setOpenMenu(link.label);
        }, 200); // wait for expand animation
      }
    } else if (link.submenu) {
      // Normal toggle
      toggleMenu(link.label);
    }
  };

  const links = [
    {
      label: "POS",
      icon: FaCashRegister,
      roles: PERMISSIONS.POS,
      to: "/pos",
    },
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
          label: "Stock Adjustments",
          roles: PERMISSIONS.STOCK_ADJUSTMENTS,
        },
        { to: "/purchases", label: "Purchases", roles: PERMISSIONS.PURCHASES },
        { to: "/vendors", label: "Vendors", roles: PERMISSIONS.VENDORS },
      ],
    },
    {
      label: "Sales",
      icon: FaShoppingCart,
      roles: [PERMISSIONS.SALES, PERMISSIONS.CUSTOMERS, PERMISSIONS.PAYMENTS],
      submenu: [
        { to: "/sales", label: "Invoices", roles: PERMISSIONS.SALES },
        { to: "/returns", label: "Returns", roles: PERMISSIONS.RETURNS },
        { to: "/customers", label: "Customers", roles: PERMISSIONS.CUSTOMERS },
        { to: "/payments", label: "Payments", roles: PERMISSIONS.PAYMENTS },
        {
          to: "/reports/sales",
          label: "Sales Reports",
          roles: PERMISSIONS.REPORTS,
        },
      ],
    },
    {
      label: "Accounts",
      icon: FaUsers,
      roles: [PERMISSIONS.CUSTOMERS, PERMISSIONS.PAYMENTS],
      submenu: [
        { to: "/customers", label: "Customers", roles: PERMISSIONS.CUSTOMERS },
        { to: "/payments", label: "Payments", roles: PERMISSIONS.PAYMENTS },
        {
          to: "/adjustments",
          label: "Adjustments",
          roles: PERMISSIONS.ADJUSTMENTS,
        },
        { to: "/returns", label: "Returns", roles: PERMISSIONS.RETURNS },
      ],
    },
    {
      label: "Reports",
      icon: FaChartBar,
      roles: [PERMISSIONS.REPORTS],
      submenu: [
        {
          to: "/reports/stock",
          label: "Stock Reports",
          roles: PERMISSIONS.REPORTS,
        },
        {
          to: "/reports/sales",
          label: "Sales Reports",
          roles: PERMISSIONS.REPORTS,
        },
        {
          to: "/reports/customers",
          label: "Customer Reports",
          roles: PERMISSIONS.REPORTS,
        },
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
      w={{ base: "full", md: isCollapsed ? "60px" : "220px" }}
      pos="fixed"
      h="full"
      p={2}
      zIndex={20}
      overflowY="auto"
      transition="width 0.2s"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
    >
      {/* Collapse / Expand button */}
      <Flex justify="flex-end" mb={4}>
        <IconButton
          aria-label="Toggle sidebar"
          size="sm"
          icon={isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          onClick={toggleCollapse}
        />
      </Flex>

      {user && !isCollapsed && (
        <Box mb={6} p={2}>
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
              <Tooltip label={isCollapsed ? link.label : ""} placement="right">
                <NavLink
                  to={link.to}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: isCollapsed ? "0" : "10px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontWeight: isActive ? "bold" : "normal",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                  })}
                  onClick={() => {
                    if (isCollapsed) {
                      setIsCollapsed(false);
                    }
                    onClose?.();
                  }}
                >
                  <Icon as={link.icon} w={5} h={5} />
                  {!isCollapsed && link.label}
                </NavLink>
              </Tooltip>
            ) : (
              <Box>
                <Tooltip
                  label={isCollapsed ? link.label : ""}
                  placement="right"
                >
                  <NavLink
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      fontWeight: "normal",
                      justifyContent: isCollapsed ? "center" : "space-between",
                    }}
                    // justifyContent={isCollapsed ? "center" : "space-between"}
                    w="full"
                    onClick={() => handleMenuClick(link)}
                    leftIcon={<Icon as={link.icon} w={5} h={5} />}
                    px={isCollapsed ? 0 : 4}
                  >
                    {!isCollapsed && (
                      <>
                        <Text flex="1" textAlign="left">
                          {link.label}
                        </Text>
                        <Text>{openMenu === link.label ? "▲" : "▼"}</Text>
                      </>
                    )}
                  </NavLink>
                </Tooltip>

                {!isCollapsed && (
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
                )}
              </Box>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box display={{ base: "none", md: "block" }}>{SidebarContent}</Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>{SidebarContent}</DrawerContent>
      </Drawer>
    </>
  );
}
