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

import { getCustomers, deleteCustomer } from "./customersApi.js";
import CustomerForm from "./CustomerForm.jsx";
import CustomerList from "./CustomerList.jsx";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await deleteCustomer(id);
      toast({ title: "Customer deleted", status: "success" });
      loadCustomers();
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
      <Flex minWidth="max-content" alignItems="center" gap="2">
        <Box p="2">
          <Heading size="md">Customers</Heading>
        </Box>
        <Spacer />
        <ButtonGroup gap="2">
          <Button
            variant="primary"
            leftIcon={<AddIcon />}
            onClick={openCreateModal}
          >
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

      <CustomerList
        customers={filteredCustomers}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <CustomerForm
        customerId={editingCustomerId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadCustomers}
      />
    </Box>
  );
}
