import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Button,
  Flex,
  Input,
  useToast,
  Spacer,
  ButtonGroup,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

import { getPayments } from "./paymentsApi.js";
import PaymentForm from "./PaymentForm.jsx";
import PaymentList from "./PaymentList.jsx";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  // Fetch payments from backend
  const loadPayments = async () => {
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (err) {
      toast({ status: "error", description: "Failed to load payments" });
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // Delete a payment
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    try {
      await fetch(`/payments/${id}`, { method: "DELETE" });
      toast({ title: "Payment deleted", status: "success" });
      loadPayments();
    } catch (err) {
      toast({ title: "Error deleting payment", status: "error" });
    }
  };

  // Open form for creating or editing
  const openCreateModal = () => {
    setEditingPaymentId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (id) => {
    setEditingPaymentId(id);
    setIsModalOpen(true);
  };

  // Filter payments by customer name or sale ID
  const filteredPayments = payments.filter((p) => {
    const customerName = p.customer?.name?.toLowerCase() || "";
    const saleUuid = p.sale?.saleUuid?.toLowerCase() || "";
    const query = filter.toLowerCase();
    return customerName.includes(query) || saleUuid.includes(query);
  });

  return (
    <Box>
      <Flex alignItems="center" gap="2" mb={4}>
        <Box>
          <Heading size="md">Payments</Heading>
        </Box>
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
        placeholder="Search by customer or sale UUID..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        mb={4}
      />

      <PaymentList
        payments={filteredPayments}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <PaymentForm
        paymentId={editingPaymentId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadPayments}
      />
    </Box>
  );
}
