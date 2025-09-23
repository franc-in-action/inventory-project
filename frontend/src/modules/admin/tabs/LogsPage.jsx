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
import LogDetailModal from "../LogDetailModal.jsx";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLogs({ search });
      const logsArray = Array.isArray(res.data)
        ? res.data
        : res.data.logs || [];
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
    <Box>
      <Text fontSize="2xl" mb={4}>
        View System Logs
      </Text>
      <Flex mb={4}>
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button ml={2} onClick={fetchLogs}>
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
      )}

      <LogDetailModal
        logId={selectedLogId}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Box>
  );
}
