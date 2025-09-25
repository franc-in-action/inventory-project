import { useEffect, useState } from "react";
import { Flex, Heading, Text, Icon, Card, useToast } from "@chakra-ui/react";
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
import { fetchProducts } from "../modules/products/productsApi.js";
import { getPayments } from "../modules/payments/paymentsApi.js";
import { apiFetch } from "../utils/commonApi.js";

const dashboardLinks = [
  { label: "Products", href: "/products", icon: FaBox },
  { label: "Stock", href: "/stock", icon: FaWarehouse }, // <- Stock link
  { label: "Sales", href: "/sales", icon: FaCashRegister },
  { label: "Purchases", href: "/purchases", icon: FaShoppingCart },
  { label: "Locations", href: "/locations", icon: FaMapMarkerAlt },
  { label: "Customers", href: "/customers", icon: FaUsers },
  { label: "Vendors", href: "/vendors", icon: FaTruck },
  { label: "Payments", href: "/payments", icon: FaMoneyBillWave },
  { label: "Admin Tools", href: "/admin-tools", icon: FaTools },
];

export default function Dashboard() {
  const user = getUserFromToken();
  const navigate = useNavigate();
  const toast = useToast();

  const [summaryData, setSummaryData] = useState([
    { label: "Total Products", value: 0, icon: FaBox },
    { label: "Total Stock Items", value: 0, icon: FaWarehouse }, // <- Stock summary
    { label: "Total Sales", value: 0, icon: FaCashRegister },
    { label: "Total Purchases", value: 0, icon: FaShoppingCart },
    { label: "Total Locations", value: 0, icon: FaMapMarkerAlt },
    { label: "Total Customers", value: 0, icon: FaUsers },
    { label: "Total Vendors", value: 0, icon: FaTruck },
    { label: "Total Payments", value: 0, icon: FaMoneyBillWave },
  ]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        // Fetch products with total count
        const productsData = await fetchProducts({ limit: 1 }); // limit 1 is enough to get total

        // Fetch other resources
        const [
          stock,
          sales,
          purchases,
          locations,
          customers,
          vendors,
          payments,
        ] = await Promise.all([
          apiFetch("/stock/all"), // Assuming this returns array
          apiFetch("/sales"),
          apiFetch("/purchases"),
          apiFetch("/locations"),
          apiFetch("/customers"),
          apiFetch("/vendors"),
          getPayments(),
        ]);

        setSummaryData([
          {
            label: "Total Products",
            value: productsData.total || 0,
            icon: FaBox,
          },
          {
            label: "Total Stock Items",
            value: stock.length || 0,
            icon: FaWarehouse,
          },
          {
            label: "Total Sales",
            value: sales.length || 0,
            icon: FaCashRegister,
          },
          {
            label: "Total Purchases",
            value: purchases.length || 0,
            icon: FaShoppingCart,
          },
          {
            label: "Total Locations",
            value: locations.length || 0,
            icon: FaMapMarkerAlt,
          },
          {
            label: "Total Customers",
            value: customers.length || 0,
            icon: FaUsers,
          },
          { label: "Total Vendors", value: vendors.length || 0, icon: FaTruck },
          {
            label: "Total Payments",
            value: payments.length || 0,
            icon: FaMoneyBillWave,
          },
        ]);
      } catch (err) {
        toast({
          status: "error",
          description: "Failed to load dashboard counts",
        });
        console.error("[Dashboard] loadCounts error:", err);
      }
    };

    loadCounts();
  }, []);

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="100vh"
      p={8}
    >
      <Heading mb={4}>Dashboard</Heading>
      {user && (
        <Text mb={6}>
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
          <Card
            key={item.label}
            direction="column"
            align="center"
            justify="center"
            flex="1 1 200px"
            minW="200px"
            maxW="250px"
            h="140px"
            p={4}
            _hover={{ shadow: "md" }}
          >
            <Icon as={item.icon} w={8} h={8} mb={2} />
            <Text fontSize="xl" fontWeight="bold">
              {item.value}
            </Text>
            <Text>{item.label}</Text>
          </Card>
        ))}
      </Flex>

      {/* Navigation Cards */}
      <Flex flexWrap="wrap" justify="center" w="100%" maxW="1200px" gap={6}>
        {dashboardLinks.map((link) => (
          <Card
            key={link.label}
            as="button"
            onClick={() => navigate(link.href)}
            direction="column"
            align="center"
            justify="center"
            flex="1 1 200px"
            minW="200px"
            maxW="250px"
            h="180px"
            _hover={{ shadow: "md", cursor: "pointer" }}
            p={4}
          >
            <Icon as={link.icon} w={10} h={10} mb={3} />
            <Text fontWeight="bold">{link.label}</Text>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}
