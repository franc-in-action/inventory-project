import React, { useState } from "react";
import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Text,
  Icon,
  Card,
  Box,
  Spacer,
  Button,
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
  FaBalanceScale,
  FaUndoAlt,
  FaChartBar,
} from "react-icons/fa";

import { getUserFromToken } from "../modules/auth/authApi.js";
import StockReportsPage from "../modules/reports/models/StockReportsPage.jsx";
import SalesReportsPage from "../modules/reports/models/SalesReportsPage.jsx";
import CustomerReportsPage from "../modules/reports/models/CustomerReportsPage.jsx";

// Import the Windows XP Window component
import { Window } from "../components/Xp.jsx";
import { XP_Tabs } from "../components/XP_Tabs.jsx";

// Dashboard navigation links
const dashboardLinks = [
  { label: "POS", href: "/pos", icon: FaCashRegister },
  { label: "Products", href: "/products", icon: FaBox },
  { label: "Stock", href: "/stock", icon: FaWarehouse },
  { label: "Sales", href: "/sales", icon: FaShoppingCart },
  { label: "Returns", href: "/returns", icon: FaUndoAlt },
  { label: "Purchases", href: "/purchases", icon: FaShoppingCart },
  { label: "Locations", href: "/locations", icon: FaMapMarkerAlt },
  { label: "Customers", href: "/customers", icon: FaUsers },
  { label: "Vendors", href: "/vendors", icon: FaTruck },
  { label: "Payments", href: "/payments", icon: FaMoneyBillWave },
  { label: "Adjustments", href: "/adjustments", icon: FaBalanceScale },
  { label: "Admin Tools", href: "/admin-tools", icon: FaTools },
  { label: "Reports", href: "/reports", icon: FaChartBar },
];

// Simple reusable navigation card
function NavCard({ icon, label, onClick }) {
  return (
    <Card
      as="button"
      onClick={onClick}
      m={2}
      p={4}
      _hover={{ bg: "gray.50", cursor: "pointer" }}
    >
      <Flex direction="column" align="center" justify="center">
        <Icon as={icon} mb={2} boxSize={6} />
        <Text>{label}</Text>
      </Flex>
    </Card>
  );
}

export default function Dashboard() {
  const user = getUserFromToken();
  const navigate = useNavigate();

  // State for showing/hiding the Windows XP Window
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  const xpTabs = [
    { label: "Music", content: <Text>Nicki Minaj, Bell Towers...</Text> },
    {
      label: "Dogs",
      content: <img src="https://place-puppy.com/200x200" alt="Dog" />,
    },
    {
      label: "Food",
      content: (
        <iframe
          width="100%"
          height="200"
          src="https://www.youtube.com/embed/TODJBQ0tnow"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ),
    },
  ];

  return (
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size={"md"} mb={2}>
            Dashboard
          </Heading>
        </Box>
        <Spacer />
      </Flex>

      {user && (
        <Text mb={6}>
          Welcome, {user.name || "User"} ({user.role})
        </Text>
      )}

      {/* Navigation Cards */}
      <Flex wrap="wrap" justify="center" mb={10}>
        {dashboardLinks.map((link) => (
          <NavCard
            key={link.label}
            icon={link.icon}
            label={link.label}
            onClick={() => navigate(link.href)}
          />
        ))}
      </Flex>

      {/* Button to open Windows XP Window */}
      <Box mb={6}>
        <Button colorScheme="blue" onClick={() => setIsWindowOpen(true)}>
          Open XP Window
        </Button>
      </Box>

      {/* Windows XP Window */}
      {isWindowOpen && (
        <Window
          title="A Window With Tabs"
          onClose={() => setIsWindowOpen(false)}
        >
          <XP_Tabs tabs={xpTabs} />
        </Window>
      )}

      {/* Reports Tabs Section */}
      <Box w="100%" maxW="1200px" mt={8}>
        <Heading size={"md"} mb={2}>
          Quick summary
        </Heading>

        <Tabs>
          <TabList>
            <Tab>Stock Reports</Tab>
            <Tab>Sales Reports</Tab>
            <Tab>Customer Reports</Tab>
          </TabList>

          <Box minH={"400px"} maxH={"400px"}>
            <TabPanels>
              <TabPanel>
                <StockReportsPage />
              </TabPanel>
              <TabPanel>
                <SalesReportsPage />
              </TabPanel>
              <TabPanel>
                <CustomerReportsPage />
              </TabPanel>
            </TabPanels>
          </Box>
        </Tabs>
      </Box>
    </Flex>
  );
}
