import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Select,
  useToast,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import { CloseBtn } from "../../../components/Xp.jsx"; // import your custom CloseBtn

import { adminApi } from "../adminApi.js";

export default function RoleForm({ user, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const [role, setRole] = useState("STAFF");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    setRole(user.role.toUpperCase());
    setLoading(false);
  }, [user, isOpen]);

  const handleChange = (e) => setRole(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    try {
      await adminApi.updateRole(user.id, { role });
      toast({ status: "success", description: "Role updated" });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to save role:", err);
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Edit User Role</ModalHeader>
        <CloseBtn onClick={onClose} />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack w="full">
              <FormControl>
                <FormLabel>User</FormLabel>
                <Select value={user?.name} isDisabled>
                  <option>{user?.name}</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select value={role} onChange={handleChange}>
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
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
