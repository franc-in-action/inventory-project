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
    <Box>
      <Text>View System Logs</Text>

      <Flex>
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={fetchLogs}>Filter</Button>
      </Flex>

      {loading ? (
        <Flex>
          <Spinner />
        </Flex>
      ) : logs.length === 0 ? (
        <Text>No logs found.</Text>
      ) : (
        <Box>
          <Table>
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => (
                <Tr key={log.id} onClick={() => openLog(log.id)}>
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
