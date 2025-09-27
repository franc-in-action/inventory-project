import { useState } from "react";
import { Box, Heading, Select, Flex, Spacer, Button } from "@chakra-ui/react";
import StockValuationReport from "./StockValuationReport.jsx";

export default function ReportsPage() {
  const [period, setPeriod] = useState("daily");
  const [locationId, setLocationId] = useState("");

  // locationId selector is optional; integrate with your locations context if needed.

  return (
    <Box>
      <Flex mb={4}>
        <Heading size="md">Access / Stock Valuation Reports</Heading>
        <Spacer />
      </Flex>

      <Flex gap={4} mb={4}>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          width="200px"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>

        {/* If you have a locations list, replace this with a dynamic select */}
        <Select
          placeholder="All Locations"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          width="250px"
        >
          {/* <option value="location-uuid">Location Name</option> */}
        </Select>

        <Button
          onClick={() => {
            /* Extra actions if needed */
          }}
        >
          Refresh
        </Button>
      </Flex>

      <StockValuationReport
        period={period}
        locationId={locationId || undefined}
      />
    </Box>
  );
}
