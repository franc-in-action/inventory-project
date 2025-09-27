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
} from "@chakra-ui/react";
import { FiPrinter } from "react-icons/fi";
import { useSales } from "./contexts/SalesContext.jsx";

export default function SalesList({ sales, onSelectSale, onPrint }) {
  const { loading } = useSales();

  if (!sales) {
    if (loading) return <Spinner label="Loading sales..." />;
  }

  if (!sales || sales.length === 0) return <Text>No sales found.</Text>;

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

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Date</Th>
          <Th>Invoice No</Th>
          <Th>Customer</Th>
          <Th>Total ($)</Th>
          <Th>Paid ($)</Th>
          <Th>Unpaid ($)</Th>
          <Th>Payment Method</Th>
          <Th>Status</Th>
          <Th>Created By</Th>
          <Th>Finalized By</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sales.map((s) => {
          const paid = (
            s.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
          ).toFixed(2);
          const total = (s.total || 0).toFixed(2);
          const unpaid = (s.total - paid).toFixed(2);
          const bgColor = parseFloat(unpaid) > 0 ? "red.50" : undefined;

          return (
            <Tr key={s.id} bg={bgColor}>
              <Td>{new Date(s.createdAt).toLocaleDateString()}</Td>
              <Td>
                <Link onClick={() => onSelectSale && onSelectSale(s)}>
                  {s.saleUuid}
                </Link>
              </Td>
              <Td>{s.customer?.name || "—"}</Td>
              <Td>{total}</Td>
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
                    onClick={() => onPrint && onPrint(s)}
                  />
                </HStack>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
