import { useEffect } from "react";
import { useReports } from "../contexts/ReportsContext.jsx";
import { Flex, Box, Heading, Spinner, Spacer } from "@chakra-ui/react";

export default function SalesReportPage({ period, locationId }) {
  const { salesReport, loading, loadSalesReport } = useReports();

  useEffect(() => {
    loadSalesReport({ period, locationId });
  }, [period, locationId, loadSalesReport]);

  if (loading && !salesReport) return <Spinner />;

  return (
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size={"md"} mb={2}>
            View and analyse different sales performance metrics
          </Heading>
        </Box>
        <Spacer />
      </Flex>
      {salesReport?.data?.length ? (
        <ul>
          {salesReport.data.map((row) => (
            <li key={row.period}>
              {row.period}: {row.sales_count} sales – ${row.total_sales}
            </li>
          ))}
        </ul>
      ) : (
        <p>No sales data</p>
      )}
    </Flex>
  );
}
