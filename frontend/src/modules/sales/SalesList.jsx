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
    <Table variant="striped" size="sm">
      <Thead>
        <Tr>
          <Th>Sale ID</Th>
          <Th>Customer</Th>
          <Th>Date</Th>
          <Th isNumeric>Total ($)</Th>
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
              <Link color="blue.500" onClick={() => onSelectSale(s)}>
                {s.customer?.name || "—"}
              </Link>
            </Td>
            <Td>{new Date(s.createdAt).toLocaleDateString()}</Td>
            <Td isNumeric>{s.total}</Td>
            <Td>{s.payments?.[0]?.method || "—"}</Td>
            <Td>{s.status || "Completed"}</Td>
            <Td>
              <HStack spacing={1}>
                <IconButton
                  aria-label="Print Invoice"
                  icon={<FiPrinter />}
                  size="sm"
                  onClick={() => onPrint && onPrint(s)} // ✅ safe call
                />
              </HStack>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
