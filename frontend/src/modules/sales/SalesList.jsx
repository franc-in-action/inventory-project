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
} from "@chakra-ui/react";
import { FiPrinter } from "react-icons/fi";

export default function SalesList({ sales, onSelectSale, onPrint }) {
  if (!sales || sales.length === 0) return <Text>No sales found.</Text>;

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Sale ID</Th>
          <Th>Customer</Th>
          <Th>Date</Th>
          <Th>Total ($)</Th>
          <Th>Payment Method</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sales.map((s) => (
          <Tr key={s.id}>
            <Td>{s.id}</Td>
            <Td>
              <Link onClick={() => onSelectSale(s)}>
                {s.customer?.name || "—"}
              </Link>
            </Td>
            <Td>{new Date(s.createdAt).toLocaleDateString()}</Td>
            <Td>{s.total}</Td>
            <Td>{s.payments?.[0]?.method || "—"}</Td>
            <Td>{s.status || "Completed"}</Td>
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
        ))}
      </Tbody>
    </Table>
  );
}
