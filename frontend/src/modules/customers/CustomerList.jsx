import { useState } from "react";
import {
  Box,
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
import CustomerDetail from "./CustomerDetail.jsx";

export default function CustomerList({ customers, onEdit, onDelete }) {
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
      <Box flex="1" h="300px" overflowY="auto" overflowX="auto">
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
            {customers.map((c) => (
              <Tr key={c.id}>
                <Td>
                  <Link onClick={() => handleOpenDetails(c.id)}>{c.name}</Link>
                </Td>
                <Td>{c.email}</Td>
                <Td>{c.phone}</Td>
                <Td>
                  <ButtonGroup>
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit"
                      onClick={() => onEdit(c.id)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete"
                      onClick={() => onDelete(c.id)}
                    />
                  </ButtonGroup>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {selectedId && (
        <CustomerDetail
          customerId={selectedId}
          isOpen={detailsOpen}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
}
