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
  ButtonGroup,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import LocationDetails from "./LocationDetails.jsx";
import { useLocations } from "./contexts/LocationsContext.jsx";

export default function LocationList({ locations, onEdit }) {
  const { deleteLocationById, loading } = useLocations();
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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      await deleteLocationById(id);
    } catch (err) {
      console.error("Failed to delete location:", err);
      alert("Error deleting location");
    }
  };

  if (loading) return <p>Loading locations...</p>;

  return (
    <>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Name
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Address
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {locations.map((loc) => (
            <Tr key={loc.id}>
              <Td>
                <Link onClick={() => handleOpenDetails(loc.id)}>
                  {loc.name}
                </Link>
              </Td>
              <Td>{loc.address}</Td>
              <Td>
                <ButtonGroup>
                  <IconButton
                    icon={<EditIcon />}
                    aria-label="Edit"
                    onClick={() => onEdit(loc.id)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete"
                    onClick={() => handleDelete(loc.id)}
                  />
                </ButtonGroup>
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
