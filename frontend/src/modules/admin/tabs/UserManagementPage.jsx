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
  Input,
  Select,
  Flex,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { adminApi } from "../adminApi.js";
import UserForm from "../forms/UserForm.jsx";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      const usersArray = Array.isArray(res) ? res : [];
      setUsers(usersArray);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast({ title: "Failed to load users", status: "error" });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!confirm("Delete user?")) return;
    try {
      await adminApi.deleteUser(userId);
      toast({ title: "User deleted", status: "info" });
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast({ title: "Failed to delete user", status: "error" });
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await adminApi.resetPassword(userId);
      toast({ title: "Password reset", status: "success" });
    } catch (err) {
      console.error("Failed to reset password:", err);
      toast({ title: "Failed to reset password", status: "error" });
    }
  };

  const openForm = (userId = null) => {
    setEditingUserId(userId);
    setIsFormOpen(true);
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) &&
          (roleFilter ? u.role === roleFilter : true)
      )
    : [];

  return (
    <Box p={{ base: 2, md: 4 }}>
      <Text fontSize="xl" mb={4}>
        Manage System Users
      </Text>
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={2}
        mb={4}
        wrap="wrap"
      >
        <Input
          flex={{ md: 1 }}
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          flex={{ md: 1 }}
          placeholder="Filter role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Staff">Staff</option>
        </Select>
        <Button colorScheme="green" onClick={() => openForm()} flexShrink={0}>
          Add User
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      ) : filteredUsers.length === 0 ? (
        <Text>No users found.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.role}</Td>
                  <Td>
                    <Flex wrap="wrap" gap={1}>
                      <Button size="sm" onClick={() => openForm(user.id)}>
                        Edit
                      </Button>
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleResetPassword(user.id)}
                      >
                        Reset
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <UserForm
        userId={editingUserId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchUsers}
      />
    </Box>
  );
}
