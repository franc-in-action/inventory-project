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
import NewPasswordModal from "../modals/NewPasswordModal.jsx";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const toast = useToast();

  const [newPassword, setNewPassword] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
      const res = await adminApi.resetPassword(userId);
      if (res?.newPassword) {
        setNewPassword(res.newPassword);
        setIsPasswordModalOpen(true);
      }
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
    <Box>
      <Text>Manage System Users</Text>

      <Flex>
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          placeholder="Filter role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Staff">Staff</option>
        </Select>
        <Button onClick={() => openForm()}>Add User</Button>
      </Flex>

      {loading ? (
        <Flex>
          <Spinner />
        </Flex>
      ) : filteredUsers.length === 0 ? (
        <Text>No users found.</Text>
      ) : (
        <Box>
          <Table>
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
                    <Flex>
                      <Button onClick={() => openForm(user.id)}>Edit</Button>
                      <Button onClick={() => handleDelete(user.id)}>
                        Delete
                      </Button>
                      <Button onClick={() => handleResetPassword(user.id)}>
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

      <NewPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        password={newPassword}
      />
    </Box>
  );
}
