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
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size={"md"} mb={2}>
            Access and generate different reports
          </Heading>
        </Box>
        <Spacer />
      </Flex>

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
    </Flex>
  );
}
