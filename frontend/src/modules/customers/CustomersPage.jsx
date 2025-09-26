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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

import { useCustomers } from "./contexts/CustomersContext.jsx";
import CustomerForm from "./CustomerForm.jsx";
import CustomerList from "./CustomerList.jsx";

export default function CustomersPage() {
  const { customers, removeCustomer, loading } = useCustomers();
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
    <Box>
      <Flex>
        <Heading size="md">Customers</Heading>
        <Spacer />
        <ButtonGroup>
          <Button leftIcon={<AddIcon />} onClick={openCreateModal}>
            Customer
          </Button>
        </ButtonGroup>
      </Flex>

      <Input
        placeholder="Search customers..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        mb={4}
      />

      {loading ? (
        <Box>Loading customers...</Box>
      ) : (
        <CustomerList
          customers={filteredCustomers}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      <CustomerForm
        customerId={editingCustomerId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
}
