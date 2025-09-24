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
  Flex,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FaUsers,
  FaUserShield,
  FaClipboardList,
  FaDatabase,
  FaFileExport,
} from "react-icons/fa";
import UserManagementPage from "./tabs/UserManagementPage.jsx";
import RolesPage from "./tabs/RolesPage.jsx";
import LogsPage from "./tabs/LogsPage.jsx";
import BackupModal from "./modals/BackupModal.jsx";
import ExportModal from "./modals/ExportModal.jsx";

export default function AdminToolsPage() {
  const [isBackupOpen, setBackupOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);

  // Determine if we are on mobile
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box>
      <Heading>Admin Tools</Heading>

      <Tabs>
        <TabList>
          <Tab>{isMobile ? <Icon as={FaUsers} /> : "Users"}</Tab>
          <Tab>{isMobile ? <Icon as={FaUserShield} /> : "Roles"}</Tab>
          <Tab>{isMobile ? <Icon as={FaClipboardList} /> : "Logs"}</Tab>
          <Tab>{isMobile ? <Icon as={FaDatabase} /> : "Backup / Restore"}</Tab>
          <Tab>{isMobile ? <Icon as={FaFileExport} /> : "Export Data"}</Tab>
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
            <Flex justify="center">
              <Button onClick={() => setBackupOpen(true)}>
                {isMobile ? <Icon as={FaDatabase} /> : "Open Backup / Restore"}
              </Button>
            </Flex>
          </TabPanel>

          <TabPanel>
            <Flex justify="center">
              <Button onClick={() => setExportOpen(true)}>
                {isMobile ? <Icon as={FaFileExport} /> : "Open Export Data"}
              </Button>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <BackupModal isOpen={isBackupOpen} onClose={() => setBackupOpen(false)} />
      <ExportModal isOpen={isExportOpen} onClose={() => setExportOpen(false)} />
    </Box>
  );
}
