import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Spacer,
  Button,
  ButtonGroup,
  useDisclosure,
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
    await reloadProducts();
    onClose();
    setEditingId(null);
  };

  return (
    <Box>
      <Flex>
        <Heading>Products</Heading>
        <Spacer />
        <ButtonGroup>
          <Button leftIcon={<AddIcon />} onClick={handleAdd}>
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
