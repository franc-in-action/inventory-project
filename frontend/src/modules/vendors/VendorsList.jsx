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
import VendorDetails from "./VendorsDetail.jsx";

export default function VendorList({ vendors, onEdit, onDelete }) {
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
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Name
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Email
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Phone
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {vendors.map((vendor) => (
            <Tr key={vendor.id}>
              <Td>
                <Link onClick={() => handleOpenDetails(vendor.id)}>
                  {vendor.name}
                </Link>
              </Td>
              <Td>{vendor.email || "-"}</Td>
              <Td>{vendor.phone || "-"}</Td>
              <Td>
                <ButtonGroup>
                  <IconButton
                    icon={<EditIcon />}
                    aria-label="Edit"
                    onClick={() => onEdit(vendor.id)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete"
                    onClick={() => onDelete(vendor.id)}
                  />
                </ButtonGroup>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {selectedId && (
        <VendorDetails
          vendorId={selectedId}
          isOpen={detailsOpen}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
}
