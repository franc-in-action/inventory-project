import { Flex, Heading, Text, Icon } from "@chakra-ui/react";
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

      <Flex flexWrap="wrap" justify="center" w="100%" maxW="1200px" gap={6}>
        {dashboardLinks.map((link) => (
          <Flex
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
            variant="dashboardCard"
          >
            <Icon as={link.icon} w={10} h={10} mb={3} />
            <Text fontWeight="bold">{link.label}</Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
