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
import RoleForm from "../RoleForm.jsx";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const toast = useToast();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRoles();
      const rolesArray = Array.isArray(res.data)
        ? res.data
        : res.data.roles || [];
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
    <Box>
      <Text fontSize="2xl" mb={4}>
        Manage Users Roles
      </Text>
      <Flex mb={4}>
        <Button colorScheme="green" onClick={() => openForm()}>
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
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {roles.map((r) => (
              <Tr key={r.id}>
                <Td>{r.userName}</Td>
                <Td>{r.role}</Td>
                <Td>
                  <Button size="sm" onClick={() => openForm(r.id)}>
                    Edit
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
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
