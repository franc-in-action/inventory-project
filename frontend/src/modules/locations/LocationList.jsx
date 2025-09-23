// src/modules/locations/LocationList.jsx
import { Table, Thead, Tbody, Tr, Th, Td, IconButton } from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

export default function LocationList({ locations, onEdit, onDelete }) {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Address</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {locations.map((loc) => (
          <Tr key={loc.id}>
            <Td>{loc.name}</Td>
            <Td>{loc.address}</Td>
            <Td>
              <IconButton
                icon={<EditIcon />}
                size="sm"
                mr={2}
                aria-label="Edit"
                onClick={() => onEdit(loc.id)}
              />
              <IconButton
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                aria-label="Delete"
                onClick={() => onDelete(loc.id)}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
