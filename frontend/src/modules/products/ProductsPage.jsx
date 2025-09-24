import { useState } from "react";
import { Box, Button, useDisclosure, Flex } from "@chakra-ui/react";
import ProductsList from "./ProductsList.jsx";
import ProductForm from "./ProductForm.jsx";

export default function Products() {
  const [editingId, setEditingId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleAdd = () => {
    setEditingId(null);
    onOpen();
  };

  const handleEdit = (id) => {
    setEditingId(id);
    onOpen();
  };

  const handleSaved = () => {
    onClose();
    setEditingId(null);
  };

  return (
    <Flex>
      <Button onClick={handleAdd}>+ New</Button>

      <ProductsList onEdit={handleEdit} refreshKey={isOpen} />

      <ProductForm
        productId={editingId}
        isOpen={isOpen}
        onClose={onClose}
        onSaved={handleSaved}
      />
    </Flex>
  );
}
