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

import { useSales } from "../sales/contexts/SalesContext.jsx";
import { fetchPurchases } from "../purchases/purchaseApi.js";
import { fetchStockMovements } from "../stock/stockApi.js";

export default function ProductDetails({
  isOpen,
  onClose,
  product,
  stock,
  locationId,
}) {
  const { sales, loading: salesLoading } = useSales();
  const [purchases, setPurchases] = useState([]);
  const [stockMovement, setStockMovement] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [loadingStock, setLoadingStock] = useState(true);

  const productSales = sales.filter((s) =>
    s.items?.some((i) => i.productId === product?.id)
  );
  const qtySold = productSales.reduce(
    (sum, s) =>
      sum + (s.items?.find((i) => i.productId === product.id)?.qty || 0),
    0
  );

  useEffect(() => {
    if (!product?.id || !isOpen) return;

    setLoadingPurchases(true);
    fetchPurchases({ productId: product.id })
      .then((res) => setPurchases(res.items || res || []))
      .catch(() => setPurchases([]))
      .finally(() => setLoadingPurchases(false));

    setLoadingStock(true);
    fetchStockMovements(product.id, locationId)
      .then((movs) => setStockMovement(movs || []))
      .catch(() => setStockMovement([]))
      .finally(() => setLoadingStock(false));
  }, [product, isOpen, locationId]);

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
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
              <Tab>Vendors</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Flex>
                  <Box>
                    <VStack align="start">
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
                {salesLoading ? (
                  <Spinner />
                ) : productSales.length === 0 ? (
                  <Text>No sales found for this product.</Text>
                ) : (
                  <>
                    <HStack>
                      <Text>
                        <b>Total Qty Sold:</b> {qtySold}
                      </Text>
                      <Text>
                        <b>Sales Count:</b> {productSales.length}
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
                        {productSales.map((s) => {
                          const item = s.items.find(
                            (i) => i.productId === product.id
                          );
                          return (
                            <Tr key={s.id}>
                              <Td>
                                {new Date(s.createdAt).toLocaleDateString()}
                              </Td>
                              <Td>
                                {s.customer?.name || s.customer_name || "—"}
                              </Td>
                              <Td isNumeric>{item?.qty || "—"}</Td>
                              <Td isNumeric>{item?.total || "—"}</Td>
                            </Tr>
                          );
                        })}
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
                          <Td>{new Date(p.createdAt).toLocaleDateString()}</Td>
                          <Td>{p.vendorId || p.vendor_name || "—"}</Td>
                          <Td isNumeric>{p.product_qty ?? "—"}</Td>
                          <Td isNumeric>{p.total}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </TabPanel>

              <TabPanel>
                {loadingStock ? (
                  <Spinner />
                ) : stockMovement.length === 0 ? (
                  <Text>No stock movement data available.</Text>
                ) : (
                  <VStack align="start">
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
                      <HStack key={m.id} justify="space-between" w="100%">
                        <VStack align="start">
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

              <TabPanel>
                {!product.productVendors?.length ? (
                  <Text>No vendors linked to this product.</Text>
                ) : (
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Vendor Name</Th>
                        <Th>Email</Th>
                        <Th>Phone</Th>
                        <Th isNumeric>Vendor Price ($)</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {product.productVendors.map((pv) => (
                        <Tr key={pv.vendor.id}>
                          <Td>{pv.vendor.name}</Td>
                          <Td>{pv.vendor.email || "—"}</Td>
                          <Td>{pv.vendor.phone || "—"}</Td>
                          <Td isNumeric>{pv.vendorPrice?.toFixed(2) || "—"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
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
