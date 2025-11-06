import { Box, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { HamburgerIcon, RepeatIcon } from "@chakra-ui/icons";
import { useLocation } from "react-router-dom";
import { getUserFromToken, getDefaultPage } from "../modules/auth/authApi.js";

const PAGE_TITLES = [
  { path: "/", title: "Home" },
  { path: "/dashboard", title: "Dashboard" },
  { path: "/pos", title: "POS Order Management" },
  { path: "/products", title: "Products" },
  { path: "/stock-adjustments", title: "Stock Adjustments" },
  { path: "/stock", title: "Stock" },
  { path: "/customers", title: "Customers" },
  { path: "/vendors", title: "Vendors" },
  { path: "/sales", title: "Sales" },
  { path: "/returns", title: "Returns" },
  { path: "/payments", title: "Payments" },
  { path: "/adjustments", title: "Adjustments" },
  { path: "/purchases", title: "Purchases" },
  { path: "/locations", title: "Locations" },
  { path: "/admin-tools", title: "Admin Tools" },
  { path: "/reports/customers", title: "Customer Reports" },
  { path: "/reports/sales", title: "Sales Reports" },
  { path: "/reports/stock", title: "Stock Reports" },
  { path: "/reports", title: "Reports" },
];

export default function Header({ onOpenSidebar, onRefresh }) {
  const location = useLocation();
  const user = getUserFromToken();
  const defaultPage = getDefaultPage();

  let headingText = "Dashboard";
  if (location.pathname !== defaultPage) {
    const match = PAGE_TITLES.find((p) => location.pathname.startsWith(p.path));
    headingText = match ? match.title : location.pathname.replace("/", "");
  }

  return (
    <Box px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }} boxShadow="sm">
      <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
        <IconButton
          display={{ base: "flex", md: "none" }}
          icon={<HamburgerIcon />}
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        />
        <Heading>{headingText}</Heading>

        <Flex align="center" gap={4}>
          <Flex align="center" alignItems="flex-end" direction="column" gap={0}>
            {user && (
              <Text>
                {user.name} ({user.role})
              </Text>
            )}
            {user?.location && (
              <Text fontSize="small" fontWeight="bold">
                {user.location}
              </Text>
            )}
          </Flex>

          <IconButton
            aria-label="Refresh content"
            icon={<RepeatIcon />}
            colorScheme="blue"
            onClick={onRefresh}
          />
        </Flex>
      </Flex>
    </Box>
  );
}
