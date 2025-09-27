import { useEffect, useState } from "react";
import {
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
} from "@chakra-ui/react";
import { useReports } from "../contexts/ReportsContext.jsx";

export default function CustomerReportsPage() {
  const { customerPerformance, loadCustomerPerformance, loading } =
    useReports();

  // UI state for filters
  const [period, setPeriod] = useState("monthly");
  const [limit, setLimit] = useState(5);

  // Load report on first render and whenever filters change
  useEffect(() => {
    loadCustomerPerformance({ period, limit });
  }, [period, limit, loadCustomerPerformance]);

  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>
        Customer Performance Reports
      </Heading>

      {/* Filter Controls */}
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
        <Text>No customer performance data available.</Text>
      )}
    </Box>
  );
}
