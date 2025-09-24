// frontend/src/modules/products/ProductDetails.jsx

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
import { fetchStockMovements } from "../stock/stockApi.js";

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

    setLoadingSales(true);
    fetchSales({ productId: product.id })
      .then((res) => {
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
      .catch(() => {
        setSales([]);
        setQtySold(0);
      })
      .finally(() => setLoadingSales(false));

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
      .catch(() => {
        setPurchases([]);
        setQtyPurchased(0);
      })
      .finally(() => setLoadingPurchases(false));

    setLoadingStock(true);
    fetchStockMovements(product.id, locationId)
      .then((movs) => setStockMovement(movs || []))
      .catch(() => setStockMovement([]))
      .finally(() => setLoadingStock(false));
  }, [product, isOpen, locationId]);

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Product Details</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Sales</Tab>
              <Tab>Purchases</Tab>
              <Tab>Movement</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Flex>
                  <Box>
                    <VStack>
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

              <TabPanel>
                {loadingSales ? (
                  <Spinner />
                ) : sales.length === 0 ? (
                  <Text>No sales found for this product.</Text>
                ) : (
                  <>
                    <HStack>
                      <Text>
                        <b>Total Qty Sold:</b> {qtySold}
                      </Text>
                      <Text>
                        <b>Sales Count:</b> {sales.length}
                      </Text>
                    </HStack>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Customer</Th>
                          <Th isNumeric>Qty</Th>
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
                            <Td isNumeric>{s.product_qty ?? "—"}</Td>
                            <Td isNumeric>{s.total}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </>
                )}
              </TabPanel>

              <TabPanel>
                {loadingPurchases ? (
                  <Spinner />
                ) : purchases.length === 0 ? (
                  <Text>No purchases found for this product.</Text>
                ) : (
                  <>
                    <HStack>
                      <Text>
                        <b>Total Qty Purchased:</b> {qtyPurchased}
                      </Text>
                      <Text>
                        <b>Purchases Count:</b> {purchases.length}
                      </Text>
                    </HStack>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Vendor</Th>
                          <Th isNumeric>Qty</Th>
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
                            <Td isNumeric>{p.product_qty ?? "—"}</Td>
                            <Td isNumeric>{p.total}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </>
                )}
              </TabPanel>

              <TabPanel>
                {loadingStock ? (
                  <Spinner />
                ) : stockMovement.length === 0 ? (
                  <Text>No stock movement data available.</Text>
                ) : (
                  <VStack>
                    <HStack>
                      <Text>
                        <b>Movements:</b> {stockMovement.length}
                      </Text>
                      <Text>
                        <b>On-hand (selected location):</b> {stock ?? "—"}
                      </Text>
                    </HStack>
                    <Divider />
                    {stockMovement.map((m) => (
                      <HStack key={m.id}>
                        <VStack>
                          <Text>
                            <b>Reason:</b> {m.reason}
                          </Text>
                          <Text>
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
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
