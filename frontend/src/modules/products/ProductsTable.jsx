import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
} from "@chakra-ui/react";

export default function ProductsTable({
  products,
  stockByProduct,
  onEdit,
  onDelete,
  onOpenDetails,
}) {
  return (
    <Box overflowX="auto" w="100%" mt={4}>
      <Table variant="simple" size="md" minW="max-content">
        <Thead>
          <Tr>
            <Th>SKU</Th>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Category</Th>
            <Th>Location</Th>
            <Th isNumeric>Quantity</Th>
            <Th isNumeric>Price ($)</Th>
            <Th>Created</Th>
            <Th>Updated</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((p) => (
            <Tr key={p.id}>
              <Td>{p.sku}</Td>
              <Td>
                <Button variant="link" onClick={() => onOpenDetails(p)}>
                  {p.name}
                </Button>
              </Td>
              <Td>{p.description || "—"}</Td>
              <Td>{p.category?.name || "—"}</Td>
              <Td>{p.location?.name || "—"}</Td>
              <Td isNumeric>{stockByProduct[p.id] ?? 0}</Td>
              <Td isNumeric>{p.price}</Td>
              <Td>{new Date(p.createdAt).toLocaleDateString()}</Td>
              <Td>{new Date(p.updatedAt).toLocaleDateString()}</Td>
              <Td>
                <HStack spacing={2}>
                  <Button size="sm" onClick={() => onEdit(p.id)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => onDelete(p.id)}
                  >
                    Delete
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
