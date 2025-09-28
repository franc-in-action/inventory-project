import { useEffect, useState } from "react";
import { Box, Text, Spinner } from "@chakra-ui/react";
import CalendarHeatmap from "react-calendar-heatmap";
import { useReports } from "../contexts/ReportsContext.jsx";
import { ComboBox } from "../../../components/Xp.jsx"; // import your ComboBox
import "react-calendar-heatmap/dist/styles.css";

export default function Heatmap() {
  const { customerActivityByCustomer, loadCustomerActivityHeatmap, loading } =
    useReports();

  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    loadCustomerActivityHeatmap();
  }, [loadCustomerActivityHeatmap]);

  useEffect(() => {
    // Set default selected customer when data loads
    const customers = Object.keys(customerActivityByCustomer).map((name) => ({
      id: name,
      name,
    }));
    if (customers.length && !selectedCustomer) {
      setSelectedCustomer(customers[0].id);
    }
  }, [customerActivityByCustomer, selectedCustomer]);

  if (loading) return <Spinner size="lg" />;

  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);

  const activity = customerActivityByCustomer[selectedCustomer] || [];

  // Prepare items for ComboBox
  const customerItems = Object.keys(customerActivityByCustomer).map((name) => ({
    id: name,
    name,
  }));

  return (
    <Box>
      <Text mb={2} fontWeight="bold">
        Customer Activity Heatmap (last 12 months)
      </Text>

      <Box maxW="300px" mb={4}>
        <ComboBox
          items={customerItems}
          selectedItemId={selectedCustomer}
          onSelect={(item) => setSelectedCustomer(item.id)}
          placeholder="Select Customer..."
        />
      </Box>

      {activity.length === 0 ? (
        <Text>No activity data for this customer.</Text>
      ) : (
        <CalendarHeatmap
          startDate={lastYear}
          endDate={today}
          values={activity}
          classForValue={(value) => {
            if (!value || value.count === 0) return "color-empty";
            if (value.count >= 4) return "color-github-4";
            if (value.count >= 2) return "color-github-2";
            return "color-github-1";
          }}
          tooltipDataAttrs={(value) => ({
            "data-tip": `${value.date}: ${value.count || 0} purchases`,
          })}
        />
      )}
    </Box>
  );
}
