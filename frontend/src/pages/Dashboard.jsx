import React from "react";
import { Flex, Heading, Text, Icon, Card } from "@chakra-ui/react";
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
} from "react-icons/fa";

import { getUserFromToken } from "../modules/auth/authApi.js";
import { useProducts } from "../modules/products/contexts/ProductsContext.jsx";
import { useCustomers } from "../modules/customers/contexts/CustomersContext.jsx";
import { useVendors } from "../modules/vendors/contexts/VendorsContext.jsx";
import { usePayments } from "../modules/payments/contexts/PaymentsContext.jsx";
import { useLocations } from "../modules/locations/contexts/LocationsContext.jsx";
import { useSales } from "../modules/sales/contexts/SalesContext.jsx";
import { usePurchases } from "../modules/purchases/contexts/PurchasesContext.jsx";

// Dashboard navigation links
const dashboardLinks = [
  { label: "Products", href: "/products", icon: FaBox },
  { label: "Stock", href: "/stock", icon: FaWarehouse },
  { label: "Sales", href: "/sales", icon: FaCashRegister },
  { label: "Returns", href: "/returns", icon: FaUndoAlt },
  { label: "Purchases", href: "/purchases", icon: FaShoppingCart },
  { label: "Locations", href: "/locations", icon: FaMapMarkerAlt },
  { label: "Customers", href: "/customers", icon: FaUsers },
  { label: "Vendors", href: "/vendors", icon: FaTruck },
  { label: "Payments", href: "/payments", icon: FaMoneyBillWave },
  { label: "Adjustments", href: "/adjustments", icon: FaBalanceScale },
  { label: "Admin Tools", href: "/admin-tools", icon: FaTools },
];

// Reusable card component
function DashboardCard({ icon, label, value, isLoading, onClick }) {
  return (
    <Card as={onClick ? "button" : "div"} onClick={onClick}>
      <Flex direction="column" align="center" justify="center">
        <Icon as={icon} mb={2} />
        {value !== undefined && (
          <Text fontWeight="bold">{isLoading ? "..." : value}</Text>
        )}
        <Text>{label}</Text>
      </Flex>
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
      label: "Total Returns",
      value: sales.filter((s) => s.isReturn).length,
      icon: FaUndoAlt,
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
    <Flex direction="column" align="center" justify="flex-start">
      <Heading>Dashboard</Heading>

      {user && (
        <Text>
          Welcome, {user.name || "User"} ({user.role})
        </Text>
      )}

      {/* Summary Cards */}
      <Flex wrap="wrap" justify="center">
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
      <Flex wrap="wrap" justify="center">
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
