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
  Heading,
  useToast,
} from "@chakra-ui/react";
import { adminApi } from "../adminApi.js";
import RoleForm from "../forms/RoleForm.jsx";

const ROLE_ORDER = ["ADMIN", "MANAGER", "STAFF"];

export default function RolesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
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

  const groupedUsers = ROLE_ORDER.map((role) => ({
    role,
    users: users.filter((u) => u.role === role),
  }));

  return (
    <Box>
      <Text>Manage User Roles</Text>

      {loading ? (
        <Flex>
          <Spinner />
        </Flex>
      ) : users.length === 0 ? (
        <Text>No users found.</Text>
      ) : (
        groupedUsers.map(({ role, users }) => (
          <Box key={role}>
            <Heading>{role}</Heading>
            {users.length === 0 ? (
              <Text>No users in this role.</Text>
            ) : (
              <Box flex="1" h="300px" overflowY="auto" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                        User
                      </Th>
                      <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.id}>
                        <Td>{user.name}</Td>
                        <Td>
                          <Button onClick={() => openForm(user)}>Edit</Button>
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
