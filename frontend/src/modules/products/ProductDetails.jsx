import { useEffect, useState } from "react";
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
  Spinner,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  HStack,
  Divider,
} from "@chakra-ui/react";

import { fetchSales } from "../sales/salesApi.js";
import { fetchPurchases } from "../purchases/purchaseApi.js";
import {
  fetchStockForProducts,
  fetchStockMovements,
} from "../stock/stockApi.js";

export default function ProductDetails({
  isOpen,
  onClose,
  product,
  stock,
  locationId,
}) {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stockMovement, setStockMovement] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [loadingStock, setLoadingStock] = useState(true);
  const [qtySold, setQtySold] = useState(0);
  const [qtyPurchased, setQtyPurchased] = useState(0);

  useEffect(() => {
    if (!product?.id || !isOpen) return;

    // Fetch sales that include this product + aggregated qtySold
    setLoadingSales(true);
    fetchSales({ productId: product.id })
      .then((res) => {
        // res may be { items, qtySold } or items array
        if (res && Array.isArray(res.items)) {
          setSales(res.items);
          setQtySold(res.qtySold || 0);
        } else if (Array.isArray(res)) {
          setSales(res);
          setQtySold(0);
        } else {
          setSales(res.sales || []);
          setQtySold(res.qtySold || 0);
        }
      })
      .catch((err) => {
        console.error("fetchSales error:", err);
        setSales([]);
        setQtySold(0);
      })
      .finally(() => setLoadingSales(false));

    // Fetch purchases that include this product + aggregated qtyPurchased
    setLoadingPurchases(true);
    fetchPurchases({ productId: product.id })
      .then((res) => {
        if (res && Array.isArray(res.items)) {
          setPurchases(res.items);
          setQtyPurchased(res.qtyPurchased || 0);
        } else if (Array.isArray(res)) {
          setPurchases(res);
          setQtyPurchased(0);
        } else {
          setPurchases(res.purchases || []);
          setQtyPurchased(res.qtyPurchased || 0);
        }
      })
      .catch((err) => {
        console.error("fetchPurchases error:", err);
        setPurchases([]);
        setQtyPurchased(0);
      })
      .finally(() => setLoadingPurchases(false));

    // Fetch stock movements for this product (optionally for the current location)
    setLoadingStock(true);
    fetchStockMovements(product.id, locationId)
      .then((movs) => {
        setStockMovement(movs || []);
      })
      .catch((err) => {
        console.error("fetchStockMovements error:", err);
        setStockMovement([]);
      })
      .finally(() => setLoadingStock(false));
  }, [product, isOpen, locationId]);

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
                {loadingSales ? (
                  <Spinner />
                ) : sales.length === 0 ? (
                  <Text>No sales found for this product.</Text>
                ) : (
                  <>
                    <HStack justify="space-between" mb={2}>
                      <Text>
                        <b>Total Qty Sold:</b> {qtySold}
                      </Text>
                      <Text>
                        <b>Sales Count:</b> {sales.length}
                      </Text>
                    </HStack>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Customer</Th>
                          <Th isNumeric>Total ($)</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sales.map((s) => (
                          <Tr key={s.id}>
                            <Td>
                              {new Date(s.createdAt).toLocaleDateString()}
                            </Td>
                            <Td>
                              {s.customer?.name || s.customer_name || "—"}
                            </Td>
                            <Td isNumeric>{s.total}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </>
                )}
              </TabPanel>

              {/* Purchases Tab */}
              <TabPanel>
                {loadingPurchases ? (
                  <Spinner />
                ) : purchases.length === 0 ? (
                  <Text>No purchases found for this product.</Text>
                ) : (
                  <>
                    <HStack justify="space-between" mb={2}>
                      <Text>
                        <b>Total Qty Purchased:</b> {qtyPurchased}
                      </Text>
                      <Text>
                        <b>Purchases Count:</b> {purchases.length}
                      </Text>
                    </HStack>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Vendor</Th>
                          <Th isNumeric>Total ($)</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {purchases.map((p) => (
                          <Tr key={p.id}>
                            <Td>
                              {new Date(p.createdAt).toLocaleDateString()}
                            </Td>
                            <Td>{p.vendorId || p.vendor_name || "—"}</Td>
                            <Td isNumeric>{p.total}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </>
                )}
              </TabPanel>

              {/* Stock Movement Tab */}
              <TabPanel>
                {loadingStock ? (
                  <Spinner />
                ) : stockMovement.length === 0 ? (
                  <Text>No stock movement data available.</Text>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text>
                        <b>Movements:</b> {stockMovement.length}
                      </Text>
                      <Text>
                        <b>On-hand (selected location):</b> {stock ?? "—"}
                      </Text>
                    </HStack>
                    <Divider />
                    {stockMovement.map((m) => (
                      <HStack
                        key={m.id}
                        justify="space-between"
                        borderWidth="1px"
                        borderRadius="md"
                        p={2}
                      >
                        <VStack align="start" spacing={0}>
                          <Text>
                            <b>Reason:</b> {m.reason}
                          </Text>
                          <Text fontSize="sm">
                            <b>Ref:</b> {m.refId || "—"} —{" "}
                            {new Date(m.createdAt).toLocaleString()}
                          </Text>
                        </VStack>
                        <Text>
                          <b>Qty:</b> {m.delta}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                )}
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
