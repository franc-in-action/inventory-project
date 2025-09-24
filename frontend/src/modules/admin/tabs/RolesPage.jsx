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
  Heading,
} from "@chakra-ui/react";
import { adminApi } from "../adminApi.js";
import RoleForm from "../forms/RoleForm.jsx";

const ROLE_ORDER = ["ADMIN", "MANAGER", "STAFF"]; // to control display order

export default function RolesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(); // returns {id, name, role}
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast({ title: "Failed to load users", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openForm = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  // Group users by role
  const groupedUsers = ROLE_ORDER.map((role) => ({
    role,
    users: users.filter((u) => u.role === role),
  }));

  return (
    <Box p={{ base: 2, md: 4 }}>
      <Text fontSize="xl" mb={4}>
        Manage User Roles
      </Text>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      ) : users.length === 0 ? (
        <Text>No users found.</Text>
      ) : (
        groupedUsers.map(({ role, users }) => (
          <Box key={role} mb={6}>
            <Heading size="md" mb={2}>
              {role}
            </Heading>
            {users.length === 0 ? (
              <Text>No users in this role.</Text>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>User</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.id}>
                        <Td>{user.name}</Td>
                        <Td>
                          <Button size="sm" onClick={() => openForm(user)}>
                            Edit
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        ))
      )}

      <RoleForm
        user={editingUser}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchUsers}
      />
    </Box>
  );
}
