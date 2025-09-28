// XP_Tabs.jsx
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

export function XP_Tabs({ tabs }) {
  return (
    <Tabs variant="unstyled">
      <TabList>
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            _selected={{
              bg: "blue.300",
              color: "white",
              border: "2px inset #fff",
            }}
            border="2px outset #fff"
            mr={1}
            px={3}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>

      <TabPanels mt={2}>
        {tabs.map((tab) => (
          <TabPanel key={tab.label} p={2}>
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
