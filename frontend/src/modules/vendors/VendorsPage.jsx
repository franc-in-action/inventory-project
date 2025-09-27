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
import { useVendors } from "./contexts/VendorsContext.jsx";
import VendorForm from "./VendorsForm.jsx";
import VendorList from "./VendorsList.jsx";

export default function VendorsPage() {
  const { vendors, removeVendor } = useVendors();
  const [filter, setFilter] = useState("");
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await removeVendor(id);
      toast({ title: "Vendor deleted", status: "success" });
    } catch (err) {
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

      <Flex mb={4} w="100%">
        <Input
          placeholder="Search vendors..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
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
