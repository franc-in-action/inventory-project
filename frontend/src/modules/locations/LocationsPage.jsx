// src/modules/locations/LocationsPage.jsx
import { useEffect, useState } from "react";
import { Box, Heading, Button, Flex, Input, useToast } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

import { fetchLocations } from "./locationsApi.js";
import { apiFetch } from "../../utils/commonApi.js";
import LocationForm from "./LocationForm.jsx";
import LocationList from "./LocationList.jsx";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const loadLocations = async () => {
    const data = await fetchLocations();
    setLocations(data);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      await apiFetch(`/locations/${id}`, { method: "DELETE" });
      toast({ title: "Location deleted", status: "success" });
      loadLocations();
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
    <Box p={4}>
      <Flex mb={4} justify="space-between" align="center">
        <Heading size="md">Branches / Locations</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          onClick={openCreateModal}
        >
          Add Location
        </Button>
      </Flex>

      <Input
        placeholder="Search locations..."
        mb={4}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <LocationList
        locations={filteredLocations}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <LocationForm
        locationId={editingLocationId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadLocations}
      />
    </Box>
  );
}
