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
import PaymentDetail from "./PaymentDetail.jsx";

export default function PaymentList({ payments, onEdit, onDelete }) {
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
      <Table variant="striped" size="sm">
        <Thead>
          <Tr>
            <Th>Customer</Th>
            <Th>Sale UUID</Th>
            <Th>Amount</Th>
            <Th>Method</Th>
            <Th>Created At</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {payments.map((p) => (
            <Tr key={p.id}>
              <Td>
                <Link onClick={() => handleOpenDetails(p.id)}>
                  {p.customer?.name || "N/A"}
                </Link>
              </Td>
              <Td>{p.sale?.saleUuid || "N/A"}</Td>
              <Td>{p.amount.toFixed(2)}</Td>
              <Td>{p.method}</Td>
              <Td>{new Date(p.createdAt).toLocaleString()}</Td>
              <Td>
                <ButtonGroup>
                  <IconButton
                    icon={<EditIcon />}
                    aria-label="Edit"
                    onClick={() => onEdit(p.id)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete"
                    onClick={() => onDelete(p.id)}
                  />
                </ButtonGroup>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {selectedId && (
        <PaymentDetail
          paymentId={selectedId}
          isOpen={detailsOpen}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
}
