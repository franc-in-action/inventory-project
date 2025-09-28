import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  VStack,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spacer,
} from "@chakra-ui/react";
import { useReports } from "../contexts/ReportsContext.jsx";
import HeatmapModal from "./HeatmapModal.jsx";

export default function CustomerReportsPage() {
  const {
    customerPerformance,
    newCustomers,
    qualifiedCustomers,
    recalledCustomers,
    loadCustomerPerformance,
    loadNewCustomers,
    loadQualifiedCustomers,
    loadRecalledCustomers,
    loading,
  } = useReports();

  // UI state
  const [period, setPeriod] = useState("monthly");
  const [limit, setLimit] = useState(5);
  const [activeTab, setActiveTab] = useState(0);

  // Load the appropriate report whenever active tab or filters change
  useEffect(() => {
    if (activeTab === 0) {
      loadCustomerPerformance({ period, limit });
    } else if (activeTab === 1) {
      loadNewCustomers({ period });
    } else if (activeTab === 2) {
      loadQualifiedCustomers();
    } else if (activeTab === 3) {
      loadRecalledCustomers();
    }
  }, [
    activeTab,
    period,
    limit,
    loadCustomerPerformance,
    loadNewCustomers,
    loadQualifiedCustomers,
    loadRecalledCustomers,
  ]);

  // Helper to format date to YYYY-MM-DD
  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  }

  // Normalize API data for frontend
  const normalizedNewCustomers = newCustomers?.map((c) => ({
    id: c.customer_id,
    name: c.customer_name,
    firstPurchaseDate: formatDate(c.first_sale_date),
  }));

  const normalizedQualifiedCustomers = qualifiedCustomers?.map((c) => ({
    id: c.customer_id,
    name: c.customer_name,
    lastSaleDate: formatDate(c.last_sale_date),
  }));

  const normalizedRecalledCustomers = recalledCustomers?.map((c) => ({
    id: c.customer_id,
    name: c.customer_name,
    purchaseDate: formatDate(c.purchase_date),
  }));

  return (
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size={"md"} mb={2}>
            View and analyse different customer performance metrics
          </Heading>
        </Box>
        <Spacer />
        <Box p="2">
          <HeatmapModal />
        </Box>
      </Flex>

      <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
        <TabList>
          <Tab>Performance</Tab>
          <Tab>New Customers</Tab>
          <Tab>Qualified Customers</Tab>
          <Tab>Recalled Customers</Tab>
        </TabList>

        <Box minH={"400px"} maxH={"400px"} overflowX={"auto"}>
          <TabPanels>
            {/* ---------------- PERFORMANCE ---------------- */}
            <TabPanel>
              <VStack align="start" mb={6} spacing={4}>
                <Box>
                  <Text fontWeight="bold">Time Period</Text>
                  <Select
                    maxW="200px"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontWeight="bold">Number of Top Customers</Text>
                  <Select
                    maxW="200px"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  >
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                    <option value={20}>Top 20</option>
                  </Select>
                </Box>
              </VStack>

              {loading && <Spinner size="lg" />}
              {!loading && customerPerformance && (
                <>
                  <Heading size="md" mt={4} mb={2}>
                    Top Customers by Total Sales
                  </Heading>
                  <Table variant="striped" size="sm" mb={8}>
                    <Thead>
                      <Tr>
                        <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                          Customer
                        </Th>
                        <Th isNumeric>Total Sales</Th>
                        <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                          Period
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {customerPerformance.topByVolume.map((item, index) => (
                        <Tr key={`${item.customer_id}-${item.period}-${index}`}>
                          <Td>{item.customer_name}</Td>
                          <Td isNumeric>${item.total_sales.toFixed(2)}</Td>
                          <Td>{item.period}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  <Divider my={6} />

                  <Heading size="md" mt={4} mb={2}>
                    Top Customers by Number of Sales
                  </Heading>
                  <Table variant="striped" size="sm">
                    <Thead>
                      <Tr>
                        <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                          Customer
                        </Th>
                        <Th isNumeric>Sales Count</Th>
                        <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                          Period
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {customerPerformance.topByFrequency.map((item, index) => (
                        <Tr key={`${item.customer_id}-${item.period}-${index}`}>
                          <Td>{item.customer_name}</Td>
                          <Td isNumeric>{item.sales_count}</Td>
                          <Td>{item.period}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </>
              )}
              {!loading && !customerPerformance && (
                <Text>No performance data available.</Text>
              )}
            </TabPanel>

            {/* ---------------- NEW CUSTOMERS ---------------- */}
            <TabPanel>
              {loading && <Spinner size="lg" />}
              {!loading && normalizedNewCustomers && (
                <Table variant="striped" size="sm">
                  <Thead>
                    <Tr>
                      <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                        Customer
                      </Th>
                      <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                        First Purchase Date
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {normalizedNewCustomers.map((c, index) => (
                      <Tr key={c.id || index}>
                        <Td>{c.name}</Td>
                        <Td>{c.firstPurchaseDate}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
              {!loading &&
                (!normalizedNewCustomers || !normalizedNewCustomers.length) && (
                  <Text>No new customers found.</Text>
                )}
            </TabPanel>

            {/* ---------------- QUALIFIED CUSTOMERS ---------------- */}
            <TabPanel>
              {loading && <Spinner size="lg" />}
              {!loading && normalizedQualifiedCustomers && (
                <Table variant="striped" size="sm">
                  <Thead>
                    <Tr>
                      <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                        Customer
                      </Th>
                      <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                        Last Sale Date
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {normalizedQualifiedCustomers.map((c, index) => (
                      <Tr key={c.id || index}>
                        <Td>{c.name}</Td>
                        <Td>{c.lastSaleDate || "-"}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
              {!loading &&
                (!normalizedQualifiedCustomers ||
                  !normalizedQualifiedCustomers.length) && (
                  <Text>No qualified customers found.</Text>
                )}
            </TabPanel>

            {/* ---------------- RECALLED CUSTOMERS ---------------- */}
            <TabPanel>
              {loading && <Spinner size="lg" />}
              {!loading && normalizedRecalledCustomers && (
                <Table variant="striped" size="sm">
                  <Thead>
                    <Tr>
                      <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                        Customer
                      </Th>
                      <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                        Purchase Date (This Month)
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {normalizedRecalledCustomers.map((c, index) => (
                      <Tr key={c.id || index}>
                        <Td>{c.name}</Td>
                        <Td>{c.purchaseDate || "-"}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
              {!loading &&
                (!normalizedRecalledCustomers ||
                  !normalizedRecalledCustomers.length) && (
                  <Text>No recalled customers found.</Text>
                )}
            </TabPanel>
          </TabPanels>
        </Box>
      </Tabs>
    </Flex>
  );
}
