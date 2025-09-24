import { Flex, Heading, Text, Icon, Card } from "@chakra-ui/react"; // import Card
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaCashRegister,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaTools,
} from "react-icons/fa";
import { getUserFromToken } from "../modules/auth/authApi.js";

const dashboardLinks = [
  { label: "Products", href: "/products", icon: FaBox },
  { label: "Sales", href: "/sales", icon: FaCashRegister },
  { label: "Purchases", href: "/purchases", icon: FaShoppingCart },
  { label: "Locations", href: "/locations", icon: FaMapMarkerAlt },
  { label: "Admin Tools", href: "/admin-tools", icon: FaTools },
];

const totalProducts = 120;
const totalSales = 54;
const totalPurchases = 30;
const totalLocations = 5;

const summaryData = [
  { label: "Total Products", value: totalProducts, icon: FaBox },
  { label: "Total Sales", value: totalSales, icon: FaCashRegister },
  { label: "Total Purchases", value: totalPurchases, icon: FaShoppingCart },
  { label: "Total Locations", value: totalLocations, icon: FaMapMarkerAlt },
];

export default function Dashboard() {
  const user = getUserFromToken();
  const navigate = useNavigate();

  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" p={8}>
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
