import { Table, Thead, Tbody, Tr, Th, Td, Text } from "@chakra-ui/react";

export default function SalesList({ sales }) {
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
        </Tr>
      </Thead>
      <Tbody>
        {sales.map((s) => (
          <Tr key={s.id}>
            <Td>{s.id}</Td>
            <Td>{s.customer?.name || "—"}</Td>
            <Td>{new Date(s.createdAt).toLocaleDateString()}</Td>
            <Td isNumeric>{s.total}</Td>
            <Td>{s.payments?.[0]?.method || "—"}</Td>
            <Td>{s.status || "Completed"}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
