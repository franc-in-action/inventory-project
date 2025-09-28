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
import AdjustmentDetail from "./AdjustmentDetail.jsx";

export default function AdjustmentList({ adjustments, onEdit }) {
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleOpenDetail = (id) => {
    setSelectedAdjustmentId(id);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setSelectedAdjustmentId(null);
    setDetailModalOpen(false);
  };

  return (
    <>
      <Box flex="1" h="300px" overflowY="auto" overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                ID
              </Th>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                Customer
              </Th>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                Amount
              </Th>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                Method
              </Th>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                Description
              </Th>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                Created At
              </Th>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {adjustments.map((a) => (
              <Tr key={a.id}>
                <Td>
                  <Link onClick={() => handleOpenDetail(a.id)}>{a.id}</Link>
                </Td>
                <Td>{a.customer?.name || "N/A"}</Td>
                <Td>{a.amount}</Td>
                <Td>{a.method || "N/A"}</Td>
                <Td>{a.description}</Td>
                <Td>{new Date(a.createdAt).toLocaleString()}</Td>
                <Td>
                  <ButtonGroup>
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit"
                      onClick={() => onEdit(a.id)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      variant="danger"
                      aria-label="Delete"
                      onClick={async () => {
                        if (!confirm("Delete this adjustment?")) return;
                        await onDelete(a.id);
                      }}
                    />
                  </ButtonGroup>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {selectedAdjustmentId && (
        <AdjustmentDetail
          adjustmentId={selectedAdjustmentId}
          isOpen={detailModalOpen}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
}
