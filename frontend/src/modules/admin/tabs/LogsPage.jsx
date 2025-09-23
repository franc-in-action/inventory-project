import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Flex,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { adminApi } from "../adminApi.js";
import LogDetailModal from "../modals/LogDetailModal.jsx";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logsArray = await adminApi.getLogs({ search });
      setLogs(logsArray);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const openLog = (logId) => {
    setSelectedLogId(logId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLogId(null);
    setIsModalOpen(false);
  };

  return (
    <Box p={{ base: 2, md: 4 }}>
      <Text fontSize="xl" mb={4}>
        View System Logs
      </Text>

      <Flex
        mb={4}
        direction={{ base: "column", md: "row" }}
        gap={2}
        wrap="wrap"
      >
        <Input
          flex={{ md: 1 }}
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={fetchLogs} flexShrink={0}>
          Filter
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      ) : logs.length === 0 ? (
        <Text>No logs found.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => (
                <Tr
                  key={log.id}
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onClick={() => openLog(log.id)}
                >
                  <Td>{log.userName}</Td>
                  <Td>{log.action}</Td>
                  <Td>{new Date(log.createdAt).toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <LogDetailModal
        logId={selectedLogId}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Box>
  );
}
