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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Box,
} from "@chakra-ui/react";

export default function ProductDetails({ isOpen, onClose, product, stock }) {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Product Details</ModalHeader>
        <ModalCloseButton />

        <ModalBody p={0}>
          <Tabs isFitted variant="enclosed" colorScheme="blue">
            <TabList overflowX="auto" flexWrap="nowrap">
              <Tab flexShrink={0}>Overview</Tab>
              <Tab flexShrink={0}>Sales</Tab>
              <Tab flexShrink={0}>Purchases</Tab>
              <Tab flexShrink={0}>Stock Movement</Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <Flex
                  direction={{ base: "column", md: "row" }}
                  align="flex-start"
                  gap={6}
                >
                  <Box flex="1">
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
                        <b>Created:</b>{" "}
                        {new Date(product.createdAt).toLocaleString()}
                      </Text>
                      <Text>
                        <b>Updated:</b>{" "}
                        {new Date(product.updatedAt).toLocaleString()}
                      </Text>
                    </VStack>
                  </Box>
                </Flex>
              </TabPanel>

              {/* Sales Tab */}
              <TabPanel>
                {/* TODO: Fetch and display sales for this product */}
                <Text fontWeight="bold" mb={2}>
                  Recent Sales
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Sales data will appear here.
                </Text>
              </TabPanel>

              {/* Purchases Tab */}
              <TabPanel>
                {/* TODO: Fetch and display purchases for this product */}
                <Text fontWeight="bold" mb={2}>
                  Recent Purchases
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Purchase history will appear here.
                </Text>
              </TabPanel>

              {/* Stock Movement Tab */}
              <TabPanel>
                {/* TODO: Fetch and display stock movement for this product */}
                <Text fontWeight="bold" mb={2}>
                  Stock Movement
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Stock movement details will appear here.
                </Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
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
