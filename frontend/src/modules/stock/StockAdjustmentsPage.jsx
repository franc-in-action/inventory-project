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
  Button,
  ButtonGroup,
  Select,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useStock } from "./contexts/StockContext.jsx";

export default function StockAdjustmentsPage() {
  const {
    movements,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalCount,
    reloadMovements,
  } = useStock();

  const [filter, setFilter] = useState("");

  // Reload movements when page or pageSize changes
  useEffect(() => {
    reloadMovements();
  }, [page, pageSize]);

  // Client-side filter by product name
  const filteredMovements = movements.filter((m) =>
    m.productName?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box>
      <Flex mb={4} align="center">
        <Heading size="md">Stock Adjustments</Heading>
        <Spacer />
        <Input
          placeholder="Filter by product..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          width="300px"
          mr={2}
        />
        <Select
          value={pageSize}
          onChange={(e) => setPageSize(parseInt(e.target.value))}
          w="120px"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </Select>
      </Flex>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                  Product
                </Th>
                <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                  Location
                </Th>
                <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                  Change
                </Th>
                <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                  Reason
                </Th>
                <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                  Reference
                </Th>
                <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                  Performed By
                </Th>
                <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                  Date
                </Th>
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

          {/* Pagination Controls */}
          <Flex mt={4} justify="center" align="center">
            <Button
              leftIcon={<ChevronLeftIcon />}
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              mr={2}
            >
              Previous
            </Button>
            <Box mx={2}>
              Page {page} of {totalPages} (Total: {totalCount})
            </Box>
            <Button
              rightIcon={<ChevronRightIcon />}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              ml={2}
            >
              Next
            </Button>
          </Flex>
        </>
      )}
    </Box>
  );
}
