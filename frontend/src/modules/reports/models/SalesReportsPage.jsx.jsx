import { useEffect } from "react";
import { useReports } from "../contexts/ReportsContext.jsx";
import { Box, Heading, Spinner } from "@chakra-ui/react";

export default function SalesReportPage({ period, locationId }) {
  const { salesReport, loading, loadSalesReport } = useReports();

  useEffect(() => {
    loadSalesReport({ period, locationId });
  }, [period, locationId, loadSalesReport]);

  if (loading && !salesReport) return <Spinner />;

  return (
    <Box mt={6}>
      <Heading size="md">Sales Report ({period})</Heading>
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
    </Box>
  );
}
