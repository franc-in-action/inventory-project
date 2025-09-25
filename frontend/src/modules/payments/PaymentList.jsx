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
import { usePayments } from "./contexts/PaymentsContext.jsx";

export default function PaymentList({ onEdit, filter = "" }) {
  const { payments, deletePayment } = usePayments();
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
    if (!confirm("Are you sure you want to delete this payment?")) return;
    try {
      await deletePayment(id);
      alert("Payment deleted");
    } catch {
      alert("Error deleting payment");
    }
  };

  // Apply filter
  const filteredPayments = payments.filter((p) => {
    const customerName = p.customer?.name?.toLowerCase() || "";
    const saleUuid = p.sale?.saleUuid?.toLowerCase() || "";
    const query = filter.toLowerCase();
    return customerName.includes(query) || saleUuid.includes(query);
  });

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
          {filteredPayments.map((p) => (
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
                    onClick={() => handleDelete(p.id)}
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
