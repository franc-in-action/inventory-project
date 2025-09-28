import { useEffect, useState, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  VStack,
  Text,
  Box,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { CloseBtn } from "../../components/Xp.jsx"; // import your custom CloseBtn

import { useVendors } from "./contexts/VendorsContext.jsx";
import { useIssuedPayments } from "../issuedpayments/contexts/IssuedPaymentsContext.jsx";

export default function VendorDetails({ vendorId, isOpen, onClose }) {
  const { getVendorById } = useVendors();
  const { issuedPayments, loading: paymentsLoading } = useIssuedPayments();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(false);

  // fetch vendor info
  useEffect(() => {
    if (!isOpen || !vendorId) return;
    setLoading(true);
    (async () => {
      try {
        const data = await getVendorById(vendorId);
        setVendor(data);
      } catch (err) {
        console.error("Failed to fetch vendor details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [vendorId, isOpen, getVendorById]);

  // filter issued payments for this vendor
  const vendorPayments = useMemo(
    () => issuedPayments.filter((p) => p.vendorId === vendorId),
    [issuedPayments, vendorId]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {loading
            ? "Loading..."
            : vendor
            ? `${vendor.name} Details`
            : "No data"}
        </ModalHeader>

        <CloseBtn onClick={onClose} />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : vendor ? (
            <Tabs>
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Products</Tab>
                <Tab>Payments</Tab>
              </TabList>
              <TabPanels>
                {/* --- Overview --- */}
                <TabPanel>
                  <Box
                    h="300px"
                    overflowY="auto"
                    border="1px solid #e2e8f0"
                    borderRadius="md"
                  >
                    <VStack align="start" spacing={3}>
                      <Text>
                        <strong>Name:</strong> {vendor.name}
                      </Text>
                      <Text>
                        <strong>Email:</strong> {vendor.email || "N/A"}
                      </Text>
                      <Text>
                        <strong>Phone:</strong> {vendor.phone || "N/A"}
                      </Text>
                      <Text>
                        <strong>Created At:</strong>{" "}
                        {new Date(vendor.createdAt).toLocaleString()}
                      </Text>
                      <Text>
                        <strong>Updated At:</strong>{" "}
                        {new Date(vendor.updatedAt).toLocaleString()}
                      </Text>
                    </VStack>
                  </Box>
                </TabPanel>

                {/* --- Products --- */}
                <TabPanel>
                  {vendor.productVendors?.length === 0 ? (
                    <Text>No products linked</Text>
                  ) : (
                    <Box
                      h="300px"
                      overflowY="auto"
                      border="1px solid #e2e8f0"
                      borderRadius="md"
                    >
                      <Table variant="striped" size="sm">
                        <Thead>
                          <Tr>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Name
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              SKU
                            </Th>
                            <Th isNumeric>Price</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {vendor.productVendors?.map((pv) => (
                            <Tr key={pv.product.id}>
                              <Td>{pv.product.name}</Td>
                              <Td>{pv.product.sku}</Td>
                              <Td isNumeric>
                                {pv.product.price?.toLocaleString(undefined, {
                                  style: "currency",
                                  currency: "USD",
                                })}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </TabPanel>

                {/* --- Payments --- */}
                <TabPanel>
                  {paymentsLoading ? (
                    <Spinner />
                  ) : vendorPayments.length === 0 ? (
                    <Text>No issued payments for this vendor</Text>
                  ) : (
                    <Box
                      h="300px"
                      overflowY="auto"
                      border="1px solid #e2e8f0"
                      borderRadius="md"
                    >
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Payment #
                            </Th>
                            <Th isNumeric>Amount</Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Method
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Date
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {vendorPayments.map((payment) => (
                            <Tr key={payment.id}>
                              <Td>{payment.paymentNumber || payment.id}</Td>
                              <Td isNumeric>
                                {payment.amount.toLocaleString(undefined, {
                                  style: "currency",
                                  currency: "USD",
                                })}
                              </Td>
                              <Td>{payment.method}</Td>
                              <Td>
                                {new Date(payment.createdAt).toLocaleString()}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Text>No data available</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
