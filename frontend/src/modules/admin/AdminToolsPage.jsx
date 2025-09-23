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
    <Box p={{ base: 2, md: 4 }}>
      <Heading mb={4}>Admin Tools</Heading>

      <Tabs variant="enclosed" colorScheme="blue" isFitted={false}>
        <TabList
          overflowX="auto"
          whiteSpace="nowrap"
          sx={{ "::-webkit-scrollbar": { display: "none" } }}
        >
          <Tab flexShrink={0}>
            {isMobile ? <Icon as={FaUsers} boxSize={5} /> : "Users"}
          </Tab>
          <Tab flexShrink={0}>
            {isMobile ? <Icon as={FaUserShield} boxSize={5} /> : "Roles"}
          </Tab>
          <Tab flexShrink={0}>
            {isMobile ? <Icon as={FaClipboardList} boxSize={5} /> : "Logs"}
          </Tab>
          <Tab flexShrink={0}>
            {isMobile ? (
              <Icon as={FaDatabase} boxSize={5} />
            ) : (
              "Backup / Restore"
            )}
          </Tab>
          <Tab flexShrink={0}>
            {isMobile ? <Icon as={FaFileExport} boxSize={5} /> : "Export Data"}
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <UserManagementPage />
          </TabPanel>
          <TabPanel p={0}>
            <RolesPage />
          </TabPanel>
          <TabPanel p={0}>
            <LogsPage />
          </TabPanel>
          <TabPanel>
            <Flex justify="center" py={4}>
              <Button
                colorScheme="yellow"
                size={{ base: "md", md: "lg" }}
                border="none"
                _hover={{ boxShadow: "none" }}
                onClick={() => setBackupOpen(true)}
              >
                {isMobile ? (
                  <Icon as={FaDatabase} boxSize={5} />
                ) : (
                  "Open Backup / Restore"
                )}
              </Button>
            </Flex>
          </TabPanel>
          <TabPanel>
            <Flex justify="center" py={4}>
              <Button
                colorScheme="blue"
                size={{ base: "md", md: "lg" }}
                border="none"
                _hover={{ boxShadow: "none" }}
                onClick={() => setExportOpen(true)}
              >
                {isMobile ? (
                  <Icon as={FaFileExport} boxSize={5} />
                ) : (
                  "Open Export Data"
                )}
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
