import { useState } from "react";
import {
  Box,
  Heading,
  Button,
  Flex,
  Input,
  Spacer,
  Select,
  useToast,
  ButtonGroup,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useVendors } from "./contexts/VendorsContext.jsx";
import VendorForm from "./VendorsForm.jsx";
import VendorList from "./VendorsList.jsx";

export default function VendorsPage() {
  const {
    vendors,
    removeVendor,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
  } = useVendors();
  const [filter, setFilter] = useState("");
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await removeVendor(id);
      toast({ title: "Vendor deleted", status: "success" });
    } catch {
      toast({ title: "Error deleting vendor", status: "error" });
    }
  };

  const openCreateModal = () => {
    setEditingVendorId(null);
    setIsModalOpen(true);
  };
  const openEditModal = (id) => {
    setEditingVendorId(id);
    setIsModalOpen(true);
  };

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size="md" mb={2}>
            Manage vendors and suppliers
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
              Vendor
            </Button>
          </ButtonGroup>
        </Flex>
      </Flex>

      <Flex mb={4} w="100%" align="center" gap={2}>
        <Input
          placeholder="Search vendors..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          w="120px"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page <= 1}
        >
          Prev
        </Button>
        <Button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Next
        </Button>
        <Box>
          Page {page} of {totalPages}
        </Box>
      </Flex>

      <VendorList
        vendors={filteredVendors}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <VendorForm
        vendorId={editingVendorId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Flex>
  );
}
