// src/modules/locations/LocationsPage.jsx
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

import LocationForm from "./LocationForm.jsx";
import LocationList from "./LocationList.jsx";
import { useLocations } from "./contexts/LocationsContext.jsx";

export default function LocationsPage() {
  const { locations, loading, deleteLocationById, loadLocations } =
    useLocations();
  const [filter, setFilter] = useState("");
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      await deleteLocationById(id);
      toast({ title: "Location deleted", status: "success" });
    } catch (err) {
      toast({ title: "Error deleting location", status: "error" });
    }
  };

  const openCreateModal = () => {
    setEditingLocationId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (id) => {
    setEditingLocationId(id);
    setIsModalOpen(true);
  };

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Flex direction="column" p={4}>
      <Flex>
        <Box p="2">
          <Heading size={"md"} mb={2}>
            Manage branches and locations
          </Heading>
        </Box>
        <Spacer />

        <Flex mb={2} w="100%" maxW="600px" justify="flex-end">
          <ButtonGroup>
            <Button
              variant={"primary"}
              leftIcon={<AddIcon />}
              onClick={openCreateModal}
            >
              New Location
            </Button>
          </ButtonGroup>
        </Flex>
      </Flex>

      <Flex mb={4} w="100%">
        <Input
          placeholder="Search locations..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Flex>

      <LocationList
        locations={filteredLocations}
        onEdit={openEditModal}
        onDelete={handleDelete}
        loading={loading}
      />

      <LocationForm
        locationId={editingLocationId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadLocations}
      />
    </Flex>
  );
}
