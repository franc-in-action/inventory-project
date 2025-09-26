import React from "react";
import {
  Flex,
  Heading,
  Text,
  Icon,
  Card,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaCashRegister,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaTools,
  FaUsers,
  FaTruck,
  FaMoneyBillWave,
  FaWarehouse,
} from "react-icons/fa";

import { getUserFromToken } from "../modules/auth/authApi.js";
import { useProducts } from "../modules/products/contexts/ProductsContext.jsx";
import { useCustomers } from "../modules/customers/contexts/CustomersContext.jsx";
import { useVendors } from "../modules/vendors/contexts/VendorsContext.jsx";
import { usePayments } from "../modules/payments/contexts/PaymentsContext.jsx";
import { useLocations } from "../modules/locations/contexts/LocationsContext.jsx";
import { useSales } from "../modules/sales/contexts/SalesContext.jsx";
import { usePurchases } from "../modules/purchases/contexts/PurchasesContext.jsx";
import { useThemeSwitcher } from "../theme/ThemeContext";

// Dashboard navigation links
const dashboardLinks = [
  { label: "Products", href: "/products", icon: FaBox },
  { label: "Stock", href: "/stock", icon: FaWarehouse },
  { label: "Sales", href: "/sales", icon: FaCashRegister },
  { label: "Purchases", href: "/purchases", icon: FaShoppingCart },
  { label: "Locations", href: "/locations", icon: FaMapMarkerAlt },
  { label: "Customers", href: "/customers", icon: FaUsers },
  { label: "Vendors", href: "/vendors", icon: FaTruck },
  { label: "Payments", href: "/payments", icon: FaMoneyBillWave },
  { label: "Admin Tools", href: "/admin-tools", icon: FaTools },
];

// Reusable card component
function DashboardCard({ icon, label, value, isLoading, onClick }) {
  const { theme } = useThemeSwitcher();

  const bg = useColorModeValue(
    theme.colors.card?.light || "#fff",
    theme.colors.card?.dark || "#333"
  );
  const border = useColorModeValue(
    theme.colors.card?.borderLight || "#ccc",
    theme.colors.card?.borderDark || "#555"
  );
  const hoverBg = useColorModeValue(
    theme.colors.card?.hoverLight || "#eee",
    theme.colors.card?.hoverDark || "#444"
  );
  const textColor = useColorModeValue(
    theme.colors.text?.light || "#000",
    theme.colors.text?.dark || "#fff"
  );

  return (
    <Card
      as={onClick ? "button" : "div"}
      onClick={onClick}
      direction="column"
      align="center"
      justify="center"
      flex="1 1 200px"
      minW="200px"
      maxW="250px"
      h={onClick ? "180px" : "140px"}
      p={4}
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="8px"
      _hover={{
        bg: onClick ? hoverBg : bg,
        cursor: onClick ? "pointer" : "default",
      }}
      transition="background-color 0.2s"
    >
      <Icon
        as={icon}
        w={onClick ? 10 : 8}
        h={onClick ? 10 : 8}
        mb={2}
        color={textColor}
      />
      <Text fontWeight="bold" color={textColor}>
        {isLoading ? "..." : value}
      </Text>
      <Text color={textColor}>{label}</Text>
    </Card>
  );
}

export default function Dashboard() {
  const user = getUserFromToken();
  const navigate = useNavigate();
  const { products, stockMap } = useProducts();
  const { customers } = useCustomers();
  const { vendors } = useVendors();
  const { payments } = usePayments();
  const { locations } = useLocations();
  const { sales, loading: salesLoading } = useSales();
  const { purchases, loading: purchasesLoading, total } = usePurchases();

  const totalStock = Object.values(stockMap).reduce((sum, qty) => sum + qty, 0);

  const summaryData = [
    { label: "Total Products", value: products.length, icon: FaBox },
    { label: "Total Stock Items", value: totalStock, icon: FaWarehouse },
    {
      label: "Total Sales",
      value: sales.length,
      icon: FaCashRegister,
      isLoading: salesLoading,
    },
    {
      label: "Total Purchases",
      value: total,
      icon: FaShoppingCart,
      isLoading: purchasesLoading,
    },
    { label: "Total Locations", value: locations.length, icon: FaMapMarkerAlt },
    { label: "Total Customers", value: customers.length, icon: FaUsers },
    { label: "Total Vendors", value: vendors.length, icon: FaTruck },
    { label: "Total Payments", value: payments.length, icon: FaMoneyBillWave },
  ];

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="100vh"
      p={{ base: 4, md: 8 }}
    >
      <Heading mb={4} fontSize={{ base: "2xl", md: "3xl" }}>
        Dashboard
      </Heading>

      {user && (
        <Text mb={6} fontSize={{ base: "md", md: "lg" }}>
          Welcome, {user.name || "User"} ({user.role})
        </Text>
      )}

      {/* Summary Cards */}
      <Flex
        flexWrap="wrap"
        justify="center"
        w="100%"
        maxW="1200px"
        gap={6}
        mb={8}
      >
        {summaryData.map((item) => (
          <DashboardCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
            isLoading={item.isLoading}
          />
        ))}
      </Flex>

      {/* Navigation Cards */}
      <Flex flexWrap="wrap" justify="center" w="100%" maxW="1200px" gap={6}>
        {dashboardLinks.map((link) => (
          <DashboardCard
            key={link.label}
            icon={link.icon}
            label={link.label}
            onClick={() => navigate(link.href)}
          />
        ))}
      </Flex>
    </Flex>
  );
}
