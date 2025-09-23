import { Flex, Heading, Text, Icon } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaCashRegister,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaTools,
  FaClipboardList,
  FaUsersCog,
  FaUserShield,
} from "react-icons/fa";
import { getUserFromToken } from "../modules/auth/authApi.js";

const dashboardLinks = [
  { label: "Products", href: "/products", icon: FaBox, colorScheme: "blue" },
  { label: "Sales", href: "/sales", icon: FaCashRegister, colorScheme: "teal" },
  {
    label: "Purchases",
    href: "/purchases",
    icon: FaShoppingCart,
    colorScheme: "purple",
  },
  {
    label: "Locations",
    href: "/locations",
    icon: FaMapMarkerAlt,
    colorScheme: "orange",
  },
  {
    label: "Admin Tools",
    href: "/admin-tools",
    icon: FaTools,
    colorScheme: "red",
  },
];

export default function Dashboard() {
  const user = getUserFromToken();
  const navigate = useNavigate();

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      minH="100vh"
      p={{ base: 4, md: 8 }}
    >
      <Heading mb={4}>Dashboard</Heading>
      {user && (
        <Text mb={6}>
          Welcome, {user.name || "User"} ({user.role})
        </Text>
      )}

      <Flex flexWrap="wrap" justify="center" gap={6} w="100%" maxW="1200px">
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
            bg={`${link.colorScheme}.50`}
            borderRadius="lg"
            borderWidth="1px"
            p={6}
            _hover={{ bg: `${link.colorScheme}.100`, boxShadow: "md" }}
            transition="all 0.2s"
          >
            <Icon
              as={link.icon}
              w={10}
              h={10}
              mb={3}
              color={`${link.colorScheme}.500`}
            />
            <Text fontWeight="bold">{link.label}</Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
