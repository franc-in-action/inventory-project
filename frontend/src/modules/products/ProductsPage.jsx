import { useState } from "react";
import {
  Heading,
  Box,
  Button,
  useDisclosure,
  Flex,
  HStack,
  ButtonGroup,
  Spacer,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ProductsList from "./ProductsList.jsx";
import ProductForm from "./ProductForm.jsx";
import { useProducts } from "./contexts/ProductsContext.jsx";

export default function Products() {
  const [editingId, setEditingId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { reloadProducts } = useProducts();

  const handleAdd = () => {
    setEditingId(null);
    onOpen();
  };

  const handleEdit = (id) => {
    setEditingId(id);
    onOpen();
  };

  const handleSaved = async () => {
    await reloadProducts(); // 🔄 Refresh after create/update
    onClose();
    setEditingId(null);
  };

  return (
    <Box>
      <Flex minWidth="max-content" alignItems="center" gap="2">
        <Box p="2">
          <Heading size="md">Products</Heading>
        </Box>
        <Spacer />
        <ButtonGroup gap="2">
          <Button variant="primary" leftIcon={<AddIcon />} onClick={handleAdd}>
            New
          </Button>
        </ButtonGroup>
      </Flex>

      <ProductsList onEdit={handleEdit} />

      <ProductForm
        productId={editingId}
        isOpen={isOpen}
        onClose={onClose}
        onSaved={handleSaved}
      />
    </Box>
  );
}
