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
    <Box>
      <Flex minWidth="max-content" alignItems="center" gap="2">
        <Box p="2">
          <Heading size="md">Vendors</Heading>
        </Box>
        <Spacer />
        <ButtonGroup gap="2">
          <Button
            variant="primary"
            leftIcon={<AddIcon />}
            onClick={openCreateModal}
          >
            Vendor
          </Button>
        </ButtonGroup>
      </Flex>

      <Input
        placeholder="Search vendors..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

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
    </Box>
  );
}
