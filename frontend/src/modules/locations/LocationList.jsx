// src/modules/locations/LocationList.jsx
import { useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Link,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import LocationDetails from "./LocationDetails.jsx";

export default function LocationList({ locations, onEdit, onDelete }) {
  const [selectedId, setSelectedId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleOpenDetails = (id) => {
    setSelectedId(id);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedId(null);
    setDetailsOpen(false);
  };

  return (
    <>
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
              <Td>
                <Link
                  color="blue.500"
                  onClick={() => handleOpenDetails(loc.id)}
                >
                  {loc.name}
                </Link>
              </Td>
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

      {selectedId && (
        <LocationDetails
          locationId={selectedId}
          isOpen={detailsOpen}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
}
