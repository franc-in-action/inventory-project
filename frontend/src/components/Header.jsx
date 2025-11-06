import {
  Box,
  Flex,
  Spacer,
  Button,
  Heading,
  IconButton,
  Text,
  ButtonGroup,
  Select,
} from "@chakra-ui/react";
import { HamburgerIcon, RepeatIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getUserFromToken,
  logout,
  getDefaultPage,
} from "../modules/auth/authApi.js";
import { useThemeSwitcher } from "../theme/ThemeContext";
import { useUserPreferences } from "../modules/userpreferences/contexts/UserPreferenceContext";

const PAGE_TITLES = [
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
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserFromToken();
  const defaultPage = getDefaultPage();

  const { themeKey, allThemes, changeTheme, colorMode, toggleColorMode } =
    useThemeSwitcher();
  const { setPreference } = useUserPreferences();

  let headingText = "ERP System";
  if (location.pathname !== defaultPage) {
    const match = PAGE_TITLES.find((p) => location.pathname.startsWith(p.path));
    headingText = match ? match.title : location.pathname.replace("/", "");
  }

  const handleThemeChange = (key) => {
    changeTheme(key); // Update UI theme
    setPreference?.("themeKey", key); // Save to UserPreferenceContext
  };

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
        <Spacer />

        {user && (
          <Text>
            {user.name} ({user.role})
          </Text>
        )}
        {user?.location && <Text>{user.location}</Text>}

        <ButtonGroup alignItems="center" gap={2}>
          <IconButton
            aria-label="Refresh content"
            icon={<RepeatIcon />}
            onClick={onRefresh}
          />
          <Button
            onClick={toggleColorMode}
            variant="outline"
            title={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
          >
            {colorMode === "light" ? "Dark Mode" : "Light Mode"}
          </Button>

          <Select
            value={themeKey}
            onChange={(e) => handleThemeChange(e.target.value)}
            width="auto"
            minW="180px"
            title="Select theme"
          >
            {allThemes?.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>

          <Button colorScheme="red" onClick={() => logout(navigate)}>
            Logout
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
}
