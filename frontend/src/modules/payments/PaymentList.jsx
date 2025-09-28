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
import InvoiceDetails from "../sales/InvoiceDetails.jsx";
import { usePayments } from "./contexts/PaymentsContext.jsx";

export default function PaymentList({ onEdit, filter = "" }) {
  const { payments, deletePayment } = usePayments();
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const handleOpenPayment = (id) => {
    setSelectedPaymentId(id);
    setPaymentModalOpen(true);
  };

  const handleClosePayment = () => {
    setSelectedPaymentId(null);
    setPaymentModalOpen(false);
  };

  const handleOpenInvoice = (saleId) => {
    setSelectedSaleId(saleId);
    setInvoiceModalOpen(true);
  };

  const handleCloseInvoice = () => {
    setSelectedSaleId(null);
    setInvoiceModalOpen(false);
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
    const paymentNumber = p.paymentNumber?.toLowerCase() || "";
    const query = filter.toLowerCase();
    return (
      customerName.includes(query) ||
      saleUuid.includes(query) ||
      paymentNumber.includes(query)
    );
  });

  return (
    <>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Payment #
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Customer
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Sale #
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Amount
            </Th>
            <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
              Method
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
          {filteredPayments.map((p) => (
            <Tr key={p.id}>
              <Td>
                <Link onClick={() => handleOpenPayment(p.id)}>
                  {p.paymentNumber}
                </Link>
              </Td>
              <Td>{p.customer?.name || "N/A"}</Td>
              <Td>
                {p.sale ? (
                  <Link onClick={() => handleOpenInvoice(p.sale.id)}>
                    {p.sale.saleUuid}
                  </Link>
                ) : (
                  "N/A"
                )}
              </Td>
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
                    variant={"danger"}
                    aria-label="Delete"
                    onClick={() => handleDelete(p.id)}
                  />
                </ButtonGroup>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Payment Details Modal */}
      {selectedPaymentId && (
        <PaymentDetail
          paymentId={selectedPaymentId}
          isOpen={paymentModalOpen}
          onClose={handleClosePayment}
        />
      )}

      {/* Invoice Details Modal */}
      {selectedSaleId && (
        <InvoiceDetails
          saleId={selectedSaleId}
          isOpen={invoiceModalOpen}
          onClose={handleCloseInvoice}
        />
      )}
    </>
  );
}
