import { useEffect, useState } from "react";
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
  Tfoot,
  Link,
} from "@chakra-ui/react";
import { useCustomers } from "../customers/contexts/CustomersContext.jsx";
import InvoiceDetails from "../sales/InvoiceDetails.jsx";
import PaymentDetail from "../payments/PaymentDetail.jsx";

export default function CustomerDetail({ customerId, isOpen, onClose }) {
  const { fetchCustomerById } = useCustomers();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal state for invoice and payment details
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    if (!isOpen || !customerId) return;

    setLoading(true);
    (async () => {
      try {
        const data = await fetchCustomerById(customerId); // fetch customer with ledger
        setCustomer(data);
      } catch (err) {
        console.error("Failed to fetch customer details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId, isOpen, fetchCustomerById]);

  if (loading || !customer) {
    return (
      <Modal size="xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customer Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Spinner />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  const { ledger = [], sales = [] } = customer;

  // Map saleId -> ledger entries
  const ledgerBySale = sales.reduce((map, s) => {
    map[s.id] = ledger.filter((e) => e.saleId === s.id);
    return map;
  }, {});

  // Compute paid amount and balance per sale
  const salesWithBalances = sales.map((s) => {
    const entries = ledgerBySale[s.id] || [];
    const paid = entries
      .filter((e) => e.type === "PAYMENT_RECEIVED")
      .reduce((sum, e) => sum + e.amount, 0);
    const balance = s.total - paid;
    return { ...s, paid, balance };
  });

  // Map saleId -> saleUuid for payments tab
  const saleMap = sales.reduce((map, s) => {
    map[s.id] = s.saleUuid;
    return map;
  }, {});

  // Filter payments from ledger
  const payments = ledger.filter((e) => e.type === "PAYMENT_RECEIVED");

  // Totals
  const totalSales = salesWithBalances.reduce((sum, s) => sum + s.total, 0);
  const totalPaid = salesWithBalances.reduce((sum, s) => sum + s.paid, 0);
  const totalBalance = totalSales - totalPaid;

  return (
    <>
      <Modal size="xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customer Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={2} mb={4}>
              <Text>
                <strong>Name:</strong> {customer.name}
              </Text>
              <Text>
                <strong>Email:</strong> {customer.email || "N/A"}
              </Text>
              <Text>
                <strong>Phone:</strong> {customer.phone || "N/A"}
              </Text>
              <Text>
                <strong>Credit Limit:</strong>{" "}
                {customer.credit_limit.toFixed(2)}
              </Text>
              <Text>
                <strong>Current Balance:</strong>{" "}
                {customer.balance?.toFixed(2) || 0}
              </Text>
              <Text>
                <strong>Total Sales:</strong> {sales.length}
              </Text>
            </VStack>

            <Tabs variant="enclosed">
              <TabList>
                <Tab>Sales</Tab>
                <Tab>Payments</Tab>
                <Tab>Ledger Adjustments</Tab>
              </TabList>

              <TabPanels>
                {/* Sales Tab */}
                <TabPanel>
                  {sales.length === 0 ? (
                    <Text>No sales for this customer</Text>
                  ) : (
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Sale #</Th>
                          <Th>Date</Th>
                          <Th>Total</Th>
                          <Th>Paid</Th>
                          <Th>Balance</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {salesWithBalances.map((s) => (
                          <Tr key={s.id}>
                            <Td>
                              <Link
                                color="blue.500"
                                onClick={() => setSelectedSale(s)}
                              >
                                {s.saleUuid}
                              </Link>
                            </Td>
                            <Td>
                              {new Date(s.createdAt).toLocaleDateString()}
                            </Td>
                            <Td>{s.total.toFixed(2)}</Td>
                            <Td>{s.paid.toFixed(2)}</Td>
                            <Td>{s.balance.toFixed(2)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                      <Tfoot>
                        <Tr fontWeight="bold">
                          <Td>Total</Td>
                          <Td></Td>
                          <Td>{totalSales.toFixed(2)}</Td>
                          <Td>{totalPaid.toFixed(2)}</Td>
                          <Td>{totalBalance.toFixed(2)}</Td>
                        </Tr>
                      </Tfoot>
                    </Table>
                  )}
                </TabPanel>

                {/* Payments Tab */}
                <TabPanel>
                  {payments.length === 0 ? (
                    <Text>No payments for this customer</Text>
                  ) : (
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Payment #</Th>
                          <Th>Date</Th>
                          <Th>Invoice #</Th>
                          <Th>Amount</Th>
                          <Th>Method</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {payments.map((p) => (
                          <Tr key={p.id}>
                            <Td>
                              <Link
                                color="blue.500"
                                onClick={() => setSelectedPayment(p.id)}
                              >
                                {p.id}
                              </Link>
                            </Td>
                            <Td>
                              {new Date(p.createdAt).toLocaleDateString()}
                            </Td>
                            <Td>
                              {p.saleId ? (
                                <Link
                                  color="blue.500"
                                  onClick={() =>
                                    setSelectedSale(
                                      sales.find((s) => s.id === p.saleId)
                                    )
                                  }
                                >
                                  {saleMap[p.saleId]}
                                </Link>
                              ) : (
                                "N/A"
                              )}
                            </Td>
                            <Td>{p.amount.toFixed(2)}</Td>
                            <Td>{p.method || "N/A"}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </TabPanel>

                {/* Ledger Adjustments Tab */}
                <TabPanel>
                  {ledger.filter((e) => !e.saleId).length === 0 ? (
                    <Text>No unallocated payments or adjustments</Text>
                  ) : (
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Entry #</Th>
                          <Th>Date</Th>
                          <Th>Type</Th>
                          <Th>Amount</Th>
                          <Th>Notes</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {ledger
                          .filter((e) => !e.saleId)
                          .map((e) => (
                            <Tr key={e.id}>
                              <Td>
                                <Link
                                  color="blue.500"
                                  onClick={() => setSelectedPayment(e.id)}
                                >
                                  {e.id}
                                </Link>
                              </Td>
                              <Td>
                                {new Date(e.createdAt).toLocaleDateString()}
                              </Td>
                              <Td>{e.type}</Td>
                              <Td>{e.amount.toFixed(2)}</Td>
                              <Td>{e.notes || "—"}</Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Invoice Details Modal */}
      {selectedSale && (
        <InvoiceDetails
          sale={selectedSale}
          isOpen={Boolean(selectedSale)}
          onClose={() => setSelectedSale(null)}
        />
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <PaymentDetail
          paymentId={selectedPayment}
          isOpen={Boolean(selectedPayment)}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </>
  );
}
