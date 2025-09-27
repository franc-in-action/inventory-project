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

  return (
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size={"md"} mb={2}>
            View and analyse different customer performance metrics
          </Heading>
        </Box>
        <Spacer />
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
                        <Th>Customer</Th>
                        <Th isNumeric>Total Sales</Th>
                        <Th>Period</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {customerPerformance.topByVolume.map((item) => (
                        <Tr key={item.customer_id + item.period}>
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
                        <Th>Customer</Th>
                        <Th isNumeric>Sales Count</Th>
                        <Th>Period</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {customerPerformance.topByFrequency.map((item) => (
                        <Tr key={item.customer_id + item.period}>
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
              {!loading && newCustomers && (
                <Table variant="striped" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Customer</Th>
                      <Th>First Purchase Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {newCustomers.map((c) => (
                      <Tr key={c.id}>
                        <Td>{c.name}</Td>
                        <Td>{c.firstPurchaseDate}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
              {!loading && !newCustomers && (
                <Text>No new customers found.</Text>
              )}
            </TabPanel>

            {/* ---------------- QUALIFIED CUSTOMERS ---------------- */}
            <TabPanel>
              {loading && <Spinner size="lg" />}
              {!loading && qualifiedCustomers && (
                <Table variant="striped" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Customer</Th>
                      <Th>Last Sale Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {qualifiedCustomers.map((c) => (
                      <Tr key={c.id}>
                        <Td>{c.name}</Td>
                        <Td>{c.lastSaleDate}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
              {!loading && !qualifiedCustomers && (
                <Text>No qualified customers found.</Text>
              )}
            </TabPanel>

            {/* ---------------- RECALLED CUSTOMERS ---------------- */}
            <TabPanel>
              {loading && <Spinner size="lg" />}
              {!loading && recalledCustomers && (
                <Table variant="striped" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Customer</Th>
                      <Th>Purchase Date (This Month)</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {recalledCustomers.map((c) => (
                      <Tr key={c.id}>
                        <Td>{c.name}</Td>
                        <Td>{c.purchaseDate}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
              {!loading && !recalledCustomers && (
                <Text>No recalled customers found.</Text>
              )}
            </TabPanel>
          </TabPanels>
        </Box>
      </Tabs>
    </Flex>
  );
}
