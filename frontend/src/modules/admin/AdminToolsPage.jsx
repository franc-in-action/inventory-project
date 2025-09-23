import { useState } from "react";
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
} from "@chakra-ui/react";
import UserManagementPage from "./tabs/UserManagementPage.jsx";
import RolesPage from "./tabs/RolesPage.jsx";
import LogsPage from "./tabs/LogsPage.jsx";
import BackupModal from "./BackupModal.jsx";
import ExportModal from "./ExportModal.jsx";

export default function AdminToolsPage() {
  const [isBackupOpen, setBackupOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);

  return (
    <Box>
      <Heading mb={4}>Admin Tools</Heading>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Users</Tab>
          <Tab>Roles</Tab>
          <Tab>Logs</Tab>
          <Tab>Backup / Restore</Tab>
          <Tab>Export Data</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <UserManagementPage />
          </TabPanel>
          <TabPanel>
            <RolesPage />
          </TabPanel>
          <TabPanel>
            <LogsPage />
          </TabPanel>
          <TabPanel>
            <Button colorScheme="yellow" onClick={() => setBackupOpen(true)}>
              Open Backup / Restore
            </Button>
          </TabPanel>
          <TabPanel>
            <Button colorScheme="blue" onClick={() => setExportOpen(true)}>
              Open Export Data
            </Button>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <BackupModal isOpen={isBackupOpen} onClose={() => setBackupOpen(false)} />
      <ExportModal isOpen={isExportOpen} onClose={() => setExportOpen(false)} />
    </Box>
  );
}
