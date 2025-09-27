import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Heading,
} from "@chakra-ui/react";
import StockReportsPage from "./models/StockReportsPage.jsx";
import SalesReportsPage from "./models/SalesReportsPage.jsx";
import CustomerReportsPage from "./models/CustomerReportsPage.jsx";

export default function ReportsPage() {
  return (
    <Box>
      <Heading size="md" mb={4}>
        Access / Reports
      </Heading>

      <Tabs colorScheme="blue" isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Stock Reports</Tab>
          <Tab>Sales Reports</Tab>
          <Tab>Customer Reports</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <StockReportsPage />
          </TabPanel>
          <TabPanel>
            <SalesReportsPage />
          </TabPanel>
          <TabPanel>
            <CustomerReportsPage />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
