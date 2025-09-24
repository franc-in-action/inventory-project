import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
} from "@chakra-ui/react";

export default function ProductDetails({ isOpen, onClose, product, stock }) {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Product Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={2}>
            <Text>
              <b>SKU:</b> {product.sku}
            </Text>
            <Text>
              <b>Name:</b> {product.name}
            </Text>
            <Text>
              <b>Description:</b> {product.description || "—"}
            </Text>
            <Text>
              <b>Category:</b> {product.category?.name || "—"}
            </Text>
            <Text>
              <b>Location:</b> {product.location?.name || "—"}
            </Text>
            <Text>
              <b>Quantity:</b> {stock}
            </Text>
            <Text>
              <b>Price:</b> ${product.price}
            </Text>
            <Text>
              <b>Created:</b> {new Date(product.createdAt).toLocaleString()}
            </Text>
            <Text>
              <b>Updated:</b> {new Date(product.updatedAt).toLocaleString()}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
