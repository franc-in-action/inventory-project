import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { fetchStockMovements } from "./stockApi.js";

export default function StockAdjustmentsPage() {
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadMovements = async () => {
    setLoading(true);
    try {
      const res = await fetchStockMovements(); // fetch all movements
      setMovements(res);
    } catch (err) {
      console.error("[StockAdjustmentsPage] Failed to load movements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  // Filter by product name (case-insensitive)
  const filteredMovements = movements.filter((m) =>
    m.productName?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box>
      <Flex>
        <Heading size="md">Stock Adjustments</Heading>
        <Spacer />
        <Input
          placeholder="Filter by product..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          width="300px"
        />
      </Flex>

      {loading ? (
        <Spinner />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Product</Th>
              <Th>Location</Th>
              <Th>Change</Th>
              <Th>Reason</Th>
              <Th>Reference</Th>
              <Th>Performed By</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredMovements.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center">
                  No adjustments found
                </Td>
              </Tr>
            ) : (
              filteredMovements.map((m) => (
                <Tr key={m.id}>
                  <Td>{m.productName || m.productId}</Td>
                  <Td>{m.locationName || m.locationId}</Td>
                  <Td>{m.delta > 0 ? `+${m.delta}` : m.delta}</Td>
                  <Td>{m.reason}</Td>
                  <Td>{m.refId || "-"}</Td>
                  <Td>{m.performedBy}</Td>
                  <Td>{new Date(m.createdAt).toLocaleString()}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
