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

import AdjustmentForm from "./AdjustmentForm.jsx";
import AdjustmentList from "./AdjustmentList.jsx";
import { usePayments } from "../payments/contexts/PaymentsContext.jsx";

export default function AdjustmentsPage() {
  const { adjustments, deleteAdjustment, reloadAdjustments } = usePayments();
  const [filter, setFilter] = useState("");
  const [editingAdjustmentId, setEditingAdjustmentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this adjustment?")) return;
    try {
      await deleteAdjustment(id);
      toast({ title: "Adjustment deleted", status: "success" });
    } catch {
      toast({ title: "Error deleting adjustment", status: "error" });
    }
  };

  const openCreateModal = () => {
    setEditingAdjustmentId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (id) => {
    setEditingAdjustmentId(id);
    setIsModalOpen(true);
  };

  const filteredAdjustments = adjustments.filter((a) => {
    const customerName = a.customer?.name?.toLowerCase() || "";
    const description = a.description?.toLowerCase() || "";
    const query = filter.toLowerCase();
    return customerName.includes(query) || description.includes(query);
  });

  return (
    <Box>
      <Flex mb={4}>
        <Heading size="md">Ledger Adjustments</Heading>
        <Spacer />
        <ButtonGroup>
          <Button
            variant="primary"
            leftIcon={<AddIcon />}
            onClick={openCreateModal}
          >
            Adjustment
          </Button>
        </ButtonGroup>
      </Flex>

      <Input
        placeholder="Search by customer or description..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        mb={4}
      />

      <AdjustmentList
        adjustments={filteredAdjustments}
        onEdit={openEditModal}
        onDelete={handleDelete}
        filter={filter}
      />

      <AdjustmentForm
        adjustmentId={editingAdjustmentId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={reloadAdjustments}
      />
    </Box>
  );
}
