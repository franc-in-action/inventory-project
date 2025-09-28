import { useState } from "react";
import {
  Box,
  Heading,
  Button,
  Flex,
  Input,
  useToast,
  Spacer,
  ButtonGroup,
  Select,
} from "@chakra-ui/react";
import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

import { useCustomers } from "./contexts/CustomersContext.jsx";
import CustomerForm from "./CustomerForm.jsx";
import CustomerList from "./CustomerList.jsx";

export default function CustomersPage() {
  const {
    customers,
    removeCustomer,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
  } = useCustomers();

  const [filter, setFilter] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await removeCustomer(id);
      toast({ title: "Customer deleted", status: "success" });
    } catch (err) {
      toast({ title: "Error deleting customer", status: "error" });
    }
  };

  const openCreateModal = () => {
    setEditingCustomerId(null);
    setIsModalOpen(true);
  };
  const openEditModal = (id) => {
    setEditingCustomerId(id);
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size="md" mb={2}>
            Manage customers
          </Heading>
        </Box>
        <Spacer />
        <Flex mb={2} w="100%" maxW="600px" justify="flex-end">
          <ButtonGroup>
            <Button leftIcon={<AddIcon />} onClick={openCreateModal}>
              New Customer
            </Button>
          </ButtonGroup>
        </Flex>
      </Flex>

      <Flex mb={4} w="100%" align="center">
        <Input
          placeholder="Search customers..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          mb={4}
        />
        <Spacer />
        <Select
          value={pageSize}
          onChange={(e) => setPageSize(parseInt(e.target.value))}
          w="120px"
          ml={2}
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </Select>
      </Flex>

      {loading ? (
        <Box>Loading customers...</Box>
      ) : (
        <>
          <CustomerList
            customers={filteredCustomers}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />

          <Flex mt={4} justify="center" align="center">
            <Button
              leftIcon={<ChevronLeftIcon />}
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              mr={2}
            >
              Previous
            </Button>
            <Box mx={2}>
              Page {page} of {totalPages}
            </Box>
            <Button
              rightIcon={<ChevronRightIcon />}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              ml={2}
            >
              Next
            </Button>
          </Flex>
        </>
      )}

      <CustomerForm
        customerId={editingCustomerId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Flex>
  );
}
