import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Button,
  Flex,
  Input,
  Spacer,
  ButtonGroup,
  Select,
  useToast,
  Text,
} from "@chakra-ui/react";
import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

import PaymentForm from "./PaymentForm.jsx";
import PaymentList from "./PaymentList.jsx";
import { usePayments } from "./contexts/PaymentsContext.jsx";

export default function PaymentsPage() {
  const {
    payments,
    loading,
    deletePayment,
    reloadPayments,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
  } = usePayments();

  const [filter, setFilter] = useState("");
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const totalPages = Math.ceil(total / pageSize);

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

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1); // Reset to first page when page size changes
  };

  // Client-side filtering for search
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

  useEffect(() => {
    reloadPayments();
  }, [page, pageSize]);

  return (
    <Flex direction="column" p={4}>
      {/* Header & New Payment Button */}
      <Flex mb={2}>
        <Box p="2">
          <Heading size="md" mb={2}>
            Manage customer payments
          </Heading>
        </Box>
        <Spacer />
        <Flex mb={2} w="100%" maxW="600px" justify="flex-end">
          <ButtonGroup>
            <Button
              colorScheme="blue"
              leftIcon={<AddIcon />}
              onClick={openCreateModal}
            >
              New Payment
            </Button>
          </ButtonGroup>
        </Flex>
      </Flex>

      {/* Search Input */}
      <Flex mb={4} w="100%">
        <Input
          placeholder="Search by customer, payment number or sale number..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          mb={4}
        />
      </Flex>

      {/* Payment List */}
      <PaymentList
        payments={filteredPayments}
        onEdit={openEditModal}
        onDelete={handleDelete}
        filter={filter}
      />

      {/* Pagination Controls */}
      <Flex mt={4} align="center" justify="space-between" flexWrap="wrap">
        <Flex align="center">
          <Button
            size="sm"
            leftIcon={<ChevronLeftIcon />}
            onClick={handlePrevPage}
            disabled={page <= 1}
            mr={2}
          >
            Prev
          </Button>
          <Text>
            Page {page} of {totalPages || 1} ({total} payments)
          </Text>
          <Button
            size="sm"
            rightIcon={<ChevronRightIcon />}
            onClick={handleNextPage}
            disabled={page >= totalPages}
            ml={2}
          >
            Next
          </Button>
        </Flex>

        <Flex align="center" mt={{ base: 2, md: 0 }}>
          <Text mr={2}>Page size:</Text>
          <Select value={pageSize} onChange={handlePageSizeChange} size="sm">
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </Flex>
      </Flex>

      {/* Payment Modal */}
      <PaymentForm
        paymentId={editingPaymentId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={reloadPayments}
      />
    </Flex>
  );
}
