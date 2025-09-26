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

import ReturnForm from "./ReturnForm.jsx";
import ReturnList from "./ReturnList.jsx";
import { useSales } from "../sales/contexts/SalesContext.jsx";

export default function ReturnsPage() {
  const { returns, reloadReturns, addReturn, deleteReturn } = useSales();
  const [filter, setFilter] = useState("");
  const [editingReturnId, setEditingReturnId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this return?")) return;
    try {
      await deleteReturn(id);
      toast({ title: "Return deleted", status: "success" });
      reloadReturns();
    } catch {
      toast({ title: "Error deleting return", status: "error" });
    }
  };

  const openCreateModal = () => {
    setEditingReturnId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (id) => {
    setEditingReturnId(id);
    setIsModalOpen(true);
  };

  const filteredReturns = returns.filter((r) => {
    const customerName = r.customer?.name?.toLowerCase() || "";
    return customerName.includes(filter.toLowerCase());
  });

  return (
    <Box>
      <Flex mb={4}>
        <Heading size="md">Returns</Heading>
        <Spacer />
        <ButtonGroup>
          <Button
            variant="primary"
            leftIcon={<AddIcon />}
            onClick={openCreateModal}
          >
            New Return
          </Button>
        </ButtonGroup>
      </Flex>

      <Input
        placeholder="Search by customer..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        mb={4}
      />

      <ReturnList
        returns={filteredReturns}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <ReturnForm
        returnId={editingReturnId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={reloadReturns}
      />
    </Box>
  );
}
