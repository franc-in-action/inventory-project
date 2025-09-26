import { useState } from "react";
import {
  Box,
  Heading,
  Button,
  Flex,
  Input,
  Spacer,
  ButtonGroup,
  useToast,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

import PaymentForm from "./PaymentForm.jsx";
import PaymentList from "./PaymentList.jsx";
import { usePayments } from "./contexts/PaymentsContext.jsx";

export default function PaymentsPage() {
  const { payments, loading, deletePayment, reloadPayments } = usePayments();
  const [filter, setFilter] = useState("");
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    try {
      await deletePayment(id);
      toast({ title: "Payment deleted", status: "success" });
    } catch {
      toast({ title: "Error deleting payment", status: "error" });
    }
  };

  const openCreateModal = () => {
    setEditingPaymentId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (id) => {
    setEditingPaymentId(id);
    setIsModalOpen(true);
  };

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
    <Box>
      <Flex>
        <Heading size="md">Payments</Heading>
        <Spacer />
        <ButtonGroup>
          <Button
            variant="primary"
            leftIcon={<AddIcon />}
            onClick={openCreateModal}
          >
            Payment
          </Button>
        </ButtonGroup>
      </Flex>

      <Input
        placeholder="Search by customer or payment number or sale UUID..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        mb={4}
      />

      <PaymentList
        payments={filteredPayments}
        onEdit={openEditModal}
        onDelete={handleDelete}
        filter={filter}
      />

      <PaymentForm
        paymentId={editingPaymentId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={reloadPayments}
      />
    </Box>
  );
}
