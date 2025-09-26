import { useEffect, useState, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vendor Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Spinner />
          ) : vendor ? (
            <Tabs isFitted variant="enclosed">
              <TabList mb="1em">
                <Tab>Overview</Tab>
                <Tab>Products</Tab>
                <Tab>Payments</Tab>
              </TabList>
              <TabPanels>
                {/* --- Overview --- */}
                <TabPanel>
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
                </TabPanel>

                {/* --- Products --- */}
                <TabPanel>
                  {vendor.productVendors?.length === 0 ? (
                    <Text>No products linked</Text>
                  ) : (
                    <Table
                      variant="simple"
                      size="sm"
                      overflow="auto"
                      height="200px"
                    >
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>SKU</Th>
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
                  )}
                </TabPanel>

                {/* --- Payments --- */}
                <TabPanel>
                  {paymentsLoading ? (
                    <Spinner />
                  ) : vendorPayments.length === 0 ? (
                    <Text>No issued payments for this vendor</Text>
                  ) : (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Payment #</Th>
                          <Th isNumeric>Amount</Th>
                          <Th>Method</Th>
                          <Th>Date</Th>
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
