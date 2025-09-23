// src/modules/admin/RoleForm.jsx
import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Input,
  Select,
  useToast,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import { adminApi } from "../adminApi.js";

export default function RoleForm({ roleId, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const [role, setRole] = useState({ userName: "", role: "Staff" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load role details when editing
  useEffect(() => {
    if (!isOpen) return;
    if (!roleId) {
      setRole({ userName: "", role: "Staff" });
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await adminApi.getRoles();
        const r = res.data.find((x) => x.id === roleId);
        if (r) setRole(r);
      } catch (err) {
        console.error("[RoleForm] Failed to load role:", err);
        toast({ status: "error", description: "Failed to load role." });
      } finally {
        setLoading(false);
      }
    })();
  }, [roleId, isOpen, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRole((r) => ({ ...r, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (roleId) {
        await adminApi.updateRole(roleId, role);
        toast({ status: "success", description: "Role updated" });
      } else {
        // replace with createRole API if exists
        await adminApi.updateRole(null, role);
        toast({ status: "success", description: "Role created" });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("[RoleForm] Error saving role:", err);
      toast({ status: "error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>{roleId ? "Edit Role" : "Create Role"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner size="xl" margin="auto" />
          ) : (
            <VStack spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>User</FormLabel>
                <Input
                  name="userName"
                  value={role.userName}
                  onChange={handleChange}
                  placeholder="User name"
                  disabled={!!roleId} // cannot change user name when editing
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select name="role" value={role.role} onChange={handleChange}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </Select>
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={saving}>
            {roleId ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
