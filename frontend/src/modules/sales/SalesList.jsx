import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Link,
  IconButton,
  HStack,
  Spinner,
  Badge,
  Button,
  Box,
  Flex,
  Select,
  Input,
} from "@chakra-ui/react";
import { FiPrinter } from "react-icons/fi";
import { useSales } from "./contexts/SalesContext.jsx";
import { useUserPreferences } from "../userpreferences/contexts/UserPreferenceContext.jsx";
import { useState, useEffect } from "react";

export default function SalesList({ onSelectSale, onPrint }) {
  const { fetchHistoricalSales, loading } = useSales();
  const { preferences, setPreference } = useUserPreferences();

  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [jumpPage, setJumpPage] = useState("");

  const pageSize = preferences.pageSize || 10;

  const loadSales = async (pageNumber = 1, pageSizeValue = pageSize) => {
    setFetching(true);
    try {
      const result = await fetchHistoricalSales({}, pageNumber, pageSizeValue);
      setSales(result.items);
      setTotal(result.total);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error(err);
      setSales([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadSales(page, pageSize);
  }, [page, pageSize]);

  const renderStatus = (status) => {
    switch (status) {
      case "COMPLETE":
        return <Badge colorScheme="green">Complete</Badge>;
      case "PENDING":
        return <Badge colorScheme="yellow">Draft</Badge>;
      case "CANCELLED":
        return <Badge colorScheme="red">Cancelled</Badge>;
      default:
        return <Badge>{status || "Unknown"}</Badge>;
    }
  };

  if (loading || fetching) return <Spinner label="Loading sales..." />;

  if (!sales.length) return <Text>No sales found.</Text>;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Text>
          Showing {sales.length} of {total} sales
        </Text>
        <HStack>
          <Text>Items per page:</Text>
          <Select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPreference("pageSize", newSize);
              setPage(1);
            }}
            width="fit-content"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </HStack>
      </Flex>

      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Date
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Invoice No
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Customer
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Total ($)
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Paid ($)
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Unpaid ($)
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Payment Method
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Status
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Created By
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Finalized By
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {sales.map((s) => {
            const paid = (
              s.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
            ).toFixed(2);
            const totalAmount = (s.total || 0).toFixed(2);
            const unpaid = (s.total - paid).toFixed(2);
            const bgColor = parseFloat(unpaid) > 0 ? "red.50" : undefined;

            return (
              <Tr key={s.id} bg={bgColor}>
                <Td>{new Date(s.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <Link onClick={() => onSelectSale?.(s)}>{s.saleUuid}</Link>
                </Td>
                <Td>{s.customer?.name || "—"}</Td>
                <Td>{totalAmount}</Td>
                <Td>{paid}</Td>
                <Td>{unpaid}</Td>
                <Td>{s.payments?.[0]?.method || "—"}</Td>
                <Td>{renderStatus(s.status)}</Td>
                <Td>{s.createdByUser?.name || "—"}</Td>
                <Td>{s.finalizedByUser?.name || "—"}</Td>
                <Td>
                  <HStack>
                    <IconButton
                      aria-label="Print Invoice"
                      icon={<FiPrinter />}
                      onClick={() => onPrint?.(s)}
                    />
                  </HStack>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <Flex justify="space-between" align="center" mt={4}>
        <Button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          isDisabled={page === 1}
        >
          Previous
        </Button>
        <HStack>
          <Text>
            Page {page} of {totalPages}
          </Text>
          <Input
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            placeholder="Go to page"
            width="80px"
            size="sm"
          />
          <Button
            size="sm"
            onClick={() => {
              const p = Math.min(Math.max(Number(jumpPage), 1), totalPages);
              if (!isNaN(p)) setPage(p);
              setJumpPage("");
            }}
          >
            Go
          </Button>
        </HStack>
        <Button
          onClick={() => setPage((p) => (hasMore ? p + 1 : p))}
          isDisabled={!hasMore}
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
}
