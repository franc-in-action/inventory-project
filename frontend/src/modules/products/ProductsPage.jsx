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
        <Box p="2">
          <Heading size={"md"} mb={2}>
            Manage products
          </Heading>
        </Box>
        <Spacer />

        <Flex mb={2} w="100%" maxW="600px" justify="flex-end">
          <ButtonGroup>
            <Button leftIcon={<AddIcon />} onClick={handleAdd}>
              New Product
            </Button>
          </ButtonGroup>
        </Flex>
      </Flex>

<Flex mb={2} w="100%" maxW="600px" justify="flex-end">
      <ProductsList onEdit={handleEdit} />
      </Flex>
      <ProductForm
        productId={editingId}
        isOpen={isOpen}
        onClose={onClose}
        onSaved={handleSaved}
      />
    </Box>
  );
}
