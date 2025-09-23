import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { adminApi } from "../adminApi.js";
import RoleForm from "../forms/RoleForm.jsx";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const toast = useToast();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const rolesArray = await adminApi.getRoles();
      setRoles(rolesArray);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      toast({ title: "Failed to load roles", status: "error" });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openForm = (roleId = null) => {
    setEditingRoleId(roleId);
    setIsFormOpen(true);
  };

  return (
    <Box p={{ base: 2, md: 4 }}>
      <Text fontSize="xl" mb={4}>
        Manage User Roles
      </Text>

      <Flex mb={4} direction={{ base: "column", md: "row" }} gap={2}>
        <Button colorScheme="green" onClick={() => openForm()} flexShrink={0}>
          Add Role
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      ) : roles.length === 0 ? (
        <Text>No roles found.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {roles.map((role) => (
                <Tr key={role.id}>
                  <Td>{role.roleName}</Td>
                  <Td>{role.roleName}</Td>
                  <Td>
                    <Flex wrap="wrap" gap={1}>
                      <Button size="sm" onClick={() => openForm(role.id)}>
                        Edit
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <RoleForm
        roleId={editingRoleId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchRoles}
      />
    </Box>
  );
}
