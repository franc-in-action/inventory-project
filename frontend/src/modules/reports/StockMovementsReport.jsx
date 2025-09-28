import { useEffect } from "react";
import { Box, Heading, Spinner } from "@chakra-ui/react";
import { useReports } from "./contexts/ReportsContext.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StockMovementsReport({ period, locationId }) {
  const { movementReport, loading, loadStockMovements } = useReports();

  useEffect(() => {
    loadStockMovements({ period, locationId });
  }, [period, locationId, loadStockMovements]);

  if (loading && !movementReport) return <Spinner />;

  const data = movementReport?.data || [];

  return (
    <Box mt={6}>
      <Heading size="md" mb={4}>
        Stock Movements ({period})
      </Heading>

      {data.length ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_delta" fill="#3182CE" name="Items Moved" />
            <Bar
              dataKey="movements_count"
              fill="#48BB78"
              name="Movements Count"
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>No data</p>
      )}
    </Box>
  );
}
