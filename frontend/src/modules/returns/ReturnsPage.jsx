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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

import ReturnForm from "./ReturnForm.jsx";
import ReturnList from "./ReturnList.jsx";
import { useSales } from "../sales/contexts/SalesContext.jsx";

export default function ReturnsPage() {
  const { returns, reloadReturns, addReturn, deleteReturn } = useSales();
  const toast = useToast();

  // Pagination & search
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReturns, setTotalReturns] = useState(0);

  const [editingReturnId, setEditingReturnId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReturnsPage = async () => {
    const result = await reloadReturns(page, pageSize, filter);
    // Assuming reloadReturns returns { items, total, page, pageSize }
    if (result?.total !== undefined) {
      setTotalReturns(result.total);
    }
  };

  useEffect(() => {
    fetchReturnsPage();
  }, [page, pageSize, filter]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this return?")) return;
    try {
      await deleteReturn(id);
      toast({ title: "Return deleted", status: "success" });
      fetchReturnsPage();
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

  return (
    <Flex direction="column" p={4}>
      <Flex mb={2}>
        <Box>
          <Heading size="md">Manage sale returns</Heading>
        </Box>
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

      <Flex mb={4} gap={2} align="center">
        <Input
          placeholder="Search by customer..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Select
          value={pageSize}
          onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          w="120px"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </Select>
      </Flex>

      <ReturnList
        returns={returns}
        onEdit={openEditModal}
        onDelete={handleDelete}
        page={page}
        pageSize={pageSize}
        total={totalReturns}
        onPageChange={setPage}
      />

      <ReturnForm
        returnId={editingReturnId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchReturnsPage}
      />
    </Flex>
  );
}
