import { useState } from "react";
import { Flex, Box, Heading, Select, Spacer, Button } from "@chakra-ui/react";
import StockValuationReport from "../StockValuationReport.jsx";
import StockMovementsReport from "../StockMovementsReport.jsx";

export default function StockReportsPage() {
  const [period, setPeriod] = useState("monthly");
  const [locationId, setLocationId] = useState("");

  return (
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size={"md"} mb={2}>
            View and analyse different stock performance metrics
          </Heading>
        </Box>
        <Spacer />
      </Flex>

      <Flex gap={4} mb={4} w="100%">
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          width="200px"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>

        {/* Optional: hook into locations context */}
        <Select
          placeholder="All Locations"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          width="250px"
        />

        <Button
          onClick={() => {
            /* Add manual refresh if needed */
          }}
        >
          Refresh
        </Button>
      </Flex>

      <StockValuationReport
        period={period}
        locationId={locationId || undefined}
      />
      <StockMovementsReport
        period={period}
        locationId={locationId || undefined}
      />
    </Flex>
  );
}
