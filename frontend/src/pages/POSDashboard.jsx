import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
  Card,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  useToast,
  Spacer,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import {
  FaCashRegister,
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaMoneyBillWave,
} from "react-icons/fa";

import { useSales } from "../modules/sales/contexts/SalesContext.jsx";
import { useProducts } from "../modules/products/contexts/ProductsContext.jsx";
import { useCustomers } from "../modules/customers/contexts/CustomersContext.jsx";
import { usePayments } from "../modules/payments/contexts/PaymentsContext.jsx";

// ---- Navigation shortcuts ----
const navItems = [
  {
    key: "sales",
    label: "Sales Entry",
    icon: FaCashRegister,
    shortcut: "Alt+S",
    href: "/sales",
  },
  {
    key: "customers",
    label: "Customers Entry",
    icon: FaUsers,
    shortcut: "Alt+C",
    href: "/customers",
  },
  {
    key: "products",
    label: "Product Entry",
    icon: FaBox,
    shortcut: "Alt+P",
    href: "/products",
  },
  {
    key: "purchases",
    label: "Purchase Entry",
    icon: FaShoppingCart,
    shortcut: "Alt+U",
    href: "/purchases",
  },
  {
    key: "payments",
    label: "Payment Entry",
    icon: FaMoneyBillWave,
    shortcut: "Alt+Y",
    href: "/payments",
  },
];

function ShortcutCard({ icon, label, shortcut, onClick }) {
  return (
    <Card
      as="button"
      onClick={onClick}
      m={2}
      p={4}
      w="180px"
      _hover={{ bg: "gray.50", cursor: "pointer" }}
    >
      <Flex direction="column" align="center" justify="center">
        <Icon as={icon} mb={2} boxSize={8} />
        <Text fontWeight="bold" mb={1}>
          {label}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {shortcut}
        </Text>
      </Flex>
    </Card>
  );
}

export default function POSDashboardWithSearch() {
  const navigate = useNavigate();
  const toast = useToast();

  // ---- Load data from contexts ----
  const { sales, loading: salesLoading } = useSales();
  const { products, loading: productsLoading } = useProducts();
  const { customers, loading: customersLoading } = useCustomers();
  const { payments, loading: paymentsLoading } = usePayments();

  // ---- Quick search state ----
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // ---- Filter results ----
  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [customers, searchTerm]
  );
  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );
  const filteredSales = useMemo(
    () =>
      sales.filter(
        (s) =>
          (s.invoice &&
            s.invoice.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (s.customerName &&
            s.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [sales, searchTerm]
  );
  const filteredPayments = useMemo(
    () =>
      payments.filter(
        (p) =>
          (p.payerName &&
            p.payerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.customerName &&
            p.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [payments, searchTerm]
  );

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handler = (e) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case "s":
            navigate("/sales");
            break;
          case "c":
            navigate("/customers");
            break;
          case "p":
            navigate("/products");
            break;
          case "u":
            navigate("/purchases");
            break;
          case "y":
            navigate("/payments");
            break;
          default:
            return;
        }
        e.preventDefault();
        toast({
          title: "Shortcut Activated",
          description: `Navigated via Alt+${e.key.toUpperCase()}`,
          status: "info",
          duration: 1500,
          isClosable: true,
          position: "bottom-right",
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, toast]);

  // ---- Search delay spinner ----
  useEffect(() => {
    if (searchTerm === "") {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(() => setIsSearching(false), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ---- Filter today's sales & payments ----
  const today = new Date().toISOString().slice(0, 10);
  const salesToday = sales.filter(
    (s) => s.createdAt && s.createdAt.slice(0, 10) === today
  );
  const paymentsToday = payments.filter(
    (p) => p.createdAt && p.createdAt.slice(0, 10) === today
  );

  const loading =
    salesLoading || productsLoading || customersLoading || paymentsLoading;

  return (
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size={"md"} mb={2}>
            Create and manage orders
          </Heading>
        </Box>
        <Spacer />

        <Flex mb={2} w="100%" maxW="600px" justify="flex-end">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search customers, sales, payments, products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>
      </Flex>

      {loading ? (
        <Spinner size="lg" />
      ) : isSearching ? (
        <Spinner size="lg" />
      ) : searchTerm ? (
        <Box mb={10} w="100%" maxW="800px">
          <Heading size="md" mb={4}>
            Search Results for “{searchTerm}”
          </Heading>

          {filteredCustomers.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold">Customers</Text>
              {filteredCustomers.map((c) => (
                <Text key={c.id} pl={2}>
                  • {c.name}
                </Text>
              ))}
            </Box>
          )}

          {filteredProducts.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold">Products</Text>
              {filteredProducts.map((p) => (
                <Text key={p.id} pl={2}>
                  • {p.name}
                </Text>
              ))}
            </Box>
          )}

          {filteredSales.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold">Sales / Invoices</Text>
              {filteredSales.map((s) => (
                <Text key={s.id} pl={2}>
                  • {s.invoice || s.id} — {s.customerName || "Unknown"} — $
                  {s.total?.toFixed(2) ?? "0.00"}
                </Text>
              ))}
            </Box>
          )}

          {filteredPayments.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold">Payments</Text>
              {filteredPayments.map((p) => (
                <Text key={p.id} pl={2}>
                  • {p.payerName || p.customerName || "Unknown"} —{" "}
                  {p.method || ""} — ${p.amount?.toFixed(2) ?? "0.00"}
                </Text>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <>
          {/* Shortcut Buttons */}
          <Flex wrap="wrap" mb={10}>
            {navItems.map((item) => (
              <ShortcutCard
                key={item.key}
                icon={item.icon}
                label={item.label}
                shortcut={item.shortcut}
                onClick={() => navigate(item.href)}
              />
            ))}
          </Flex>

          {/* Summary Tables */}
          <Flex wrap="wrap" gap={8}>
            <Box flex="1" minW="300px">
              <Heading size="md" mb={4}>
                Sales Today
              </Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Invoice</Th>
                    <Th>Customer</Th>
                    <Th isNumeric>Total ($)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {salesToday.map((s) => (
                    <Tr key={s.id}>
                      <Td>{s.invoice || s.id}</Td>
                      <Td>{s.customerName || "Unknown"}</Td>
                      <Td isNumeric>{s.total?.toFixed(2) ?? "0.00"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            <Box flex="1" minW="300px">
              <Heading size="md" mb={4}>
                Payments Today
              </Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Payer</Th>
                    <Th>Method</Th>
                    <Th isNumeric>Amount ($)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paymentsToday.map((p) => (
                    <Tr key={p.id}>
                      <Td>{p.payerName || p.customerName || "Unknown"}</Td>
                      <Td>{p.method || ""}</Td>
                      <Td isNumeric>{p.amount?.toFixed(2) ?? "0.00"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Flex>
        </>
      )}
    </Flex>
  );
}
