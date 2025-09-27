import { useEffect } from "react";
import { Box, Heading, Spinner } from "@chakra-ui/react";
import { useReports } from "./contexts/ReportsContext.jsx";

export default function StockMovementsReport({ period, locationId }) {
  const { movementReport, loading, loadStockMovements } = useReports();

  useEffect(() => {
    loadStockMovements({ period, locationId });
  }, [period, locationId, loadStockMovements]);

  if (loading && !movementReport) return <Spinner />;

  return (
    <Box mt={6}>
      <Heading size="md" mb={4}>
        Stock Movements ({period})
      </Heading>
      {movementReport?.data?.length ? (
        <ul>
          {movementReport.data.map((row) => (
            <li key={row.period}>
              {row.period}: {row.total_delta} items moved ({row.movements_count}{" "}
              movements)
            </li>
          ))}
        </ul>
      ) : (
        <p>No data</p>
      )}
    </Box>
  );
}
