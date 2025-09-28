import { useEffect, useState } from "react";
import { useReports } from "../contexts/ReportsContext.jsx";
import { Flex, Box, Heading, Spinner, Select, Spacer } from "@chakra-ui/react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

// Extend dayjs with the plugin
dayjs.extend(weekOfYear);

export default function SalesReportPage({ locationId }) {
  const { salesReport, loading, loadSalesReport } = useReports();
  const [period, setPeriod] = useState("monthly"); // default to monthly

  useEffect(() => {
    loadSalesReport({ period, locationId });
  }, [period, locationId, loadSalesReport]);

  if (loading && !salesReport) return <Spinner />;

  // Sort and take last 6 months/weeks/days depending on period
  const filteredData =
    salesReport?.data
      ?.slice()
      .sort((a, b) => new Date(a.period) - new Date(b.period))
      .slice(-6) || [];

  return (
    <Flex direction="column" p={4}>
      <Flex mb={4} align="center">
        <Box>
          <Heading size="md">Sales Report (Last 6 periods)</Heading>
        </Box>
        <Spacer />
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          width="200px"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>
      </Flex>

      {filteredData.length ? (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickFormatter={(date) =>
                period === "daily"
                  ? dayjs(date).format("DD MMM")
                  : period === "weekly"
                  ? "Wk " + dayjs(date).week()
                  : dayjs(date).format("MMM YYYY")
              }
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              labelFormatter={(date) =>
                period === "daily"
                  ? dayjs(date).format("DD MMM YYYY")
                  : period === "weekly"
                  ? "Week " + dayjs(date).week()
                  : dayjs(date).format("MMMM YYYY")
              }
              formatter={(value, name) => {
                if (name === "total_sales") return [`$${value}`, "Total Sales"];
                return [value, "Sales Count"];
              }}
            />
            <Legend />
            {/* Bar for total sales (volume) */}
            <Bar
              yAxisId="left"
              dataKey="total_sales"
              fill="#3182CE"
              name="Total Sales ($)"
              barSize={20}
            />
            {/* Line for sales count */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sales_count"
              stroke="#48BB78"
              name="Sales Count"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <p>No sales data</p>
      )}
    </Flex>
  );
}
