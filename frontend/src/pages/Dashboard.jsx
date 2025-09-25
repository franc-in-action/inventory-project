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
import { useProducts } from "../modules/products/contexts/ProductsContext.jsx";
import { useCustomers } from "../modules/customers/contexts/CustomersContext.jsx";
import { useVendors } from "../modules/vendors/contexts/VendorsContext.jsx";
import { usePayments } from "../modules/payments/contexts/PaymentsContext.jsx";
import { fetchPurchases } from "../modules/purchases/purchaseApi.js";
import { fetchLocations } from "../modules/locations/locationsApi.js";
import { fetchSales } from "../modules/sales/salesApi.js";
import { useEffect, useState } from "react";

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

export default function Dashboard() {
  const user = getUserFromToken();
  const navigate = useNavigate();
  const toast = useToast();

  const { products, stockMap } = useProducts();
  const { customers } = useCustomers();
  const { vendors } = useVendors();
  const { payments } = usePayments(); // ✅ use PaymentsContext

  const [purchasesTotal, setPurchasesTotal] = useState(0);
  const [salesTotal, setSalesTotal] = useState(0);
  const [locationsTotal, setLocationsTotal] = useState(0);

  // Load dynamic counts for purchases, sales, locations
  useEffect(() => {
    const loadDynamicCounts = async () => {
      try {
        const [purchasesData, salesData, locationsData] = await Promise.all([
          fetchPurchases({ limit: 1 }),
          fetchSales({ limit: 1 }),
          fetchLocations(),
        ]);

        setPurchasesTotal(purchasesData.total || 0);
        setSalesTotal(salesData.total || 0);
        setLocationsTotal(locationsData.length || 0);
      } catch (err) {
        toast({
          status: "error",
          description: "Failed to load dynamic dashboard counts",
        });
        console.error("[Dashboard] loadDynamicCounts error:", err);
      }
    };

    loadDynamicCounts();
  }, [toast]);

  const totalStock = Object.values(stockMap).reduce((sum, qty) => sum + qty, 0);

  const summaryData = [
    { label: "Total Products", value: products.length, icon: FaBox },
    { label: "Total Stock Items", value: totalStock, icon: FaWarehouse },
    { label: "Total Sales", value: salesTotal, icon: FaCashRegister },
    { label: "Total Purchases", value: purchasesTotal, icon: FaShoppingCart },
    { label: "Total Locations", value: locationsTotal, icon: FaMapMarkerAlt },
    { label: "Total Customers", value: customers.length, icon: FaUsers },
    { label: "Total Vendors", value: vendors.length, icon: FaTruck },
    { label: "Total Payments", value: payments.length, icon: FaMoneyBillWave }, // ✅ reactive
  ];

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
