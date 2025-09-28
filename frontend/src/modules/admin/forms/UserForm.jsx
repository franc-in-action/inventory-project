import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Input,
  Select,
  useToast,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import { CloseBtn } from "../../../components/Xp.jsx"; // import your custom CloseBtn

import { adminApi } from "../adminApi.js";

export default function UserForm({ userId, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const [user, setUser] = useState({ name: "", email: "", role: "STAFF" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (!userId) {
      setUser({ name: "", email: "", role: "STAFF" });
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const users = await adminApi.getUsers();
        const u = users.find((x) => x.id === userId);
        if (u) setUser({ ...u, role: u.role.toUpperCase() });
      } catch (err) {
        console.error("[UserForm] Failed to load user:", err);
        toast({ status: "error", description: "Failed to load user." });
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, isOpen, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((u) => ({ ...u, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const userData = { ...user, role: user.role.toUpperCase() };

      if (userId) {
        await adminApi.updateUser(userId, userData);
        toast({ status: "success", description: "User updated" });
      } else {
        await adminApi.createUser(userData);
        toast({ status: "success", description: "User created" });
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("[UserForm] Error saving user:", err);
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>{userId ? "Edit User" : "Create User"}</ModalHeader>
        <CloseBtn onClick={onClose} />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack w="full">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  autoComplete="name"
                  value={user.name}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={user.email}
                  onChange={handleChange}
                  disabled={!!userId}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select name="role" value={user.role} onChange={handleChange}>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="STAFF">Staff</option>
                </Select>
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={saving}>
            {userId ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
