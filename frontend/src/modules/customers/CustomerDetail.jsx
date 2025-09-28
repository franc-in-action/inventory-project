import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
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
  Box,
} from "@chakra-ui/react";
import { CloseBtn } from "../../components/Xp.jsx"; // import your custom CloseBtn

import { useCustomers } from "../customers/contexts/CustomersContext.jsx";
import { useSales } from "../sales/contexts/SalesContext.jsx";
import InvoiceDetails from "../sales/InvoiceDetails.jsx";
import PaymentDetail from "../payments/PaymentDetail.jsx";

export default function CustomerDetail({ customerId, isOpen, onClose }) {
  const { fetchCustomerById } = useCustomers();
  const { sales } = useSales();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
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
          <CloseBtn onClick={onClose} />
          <ModalBody display="flex" justifyContent="center" alignItems="center">
            <Spinner />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  const { ledger = [] } = customer;

  // Filter sales for this customer from SalesContext
  const customerSales = sales.filter((s) => s.customerId === customerId);

  // Map saleId -> ledger entries
  const ledgerBySale = customerSales.reduce((map, s) => {
    map[s.id] = ledger.filter((e) => e.saleId === s.id);
    return map;
  }, {});

  // Compute paid amount and balance per sale
  const salesWithBalances = customerSales.map((s) => {
    const entries = ledgerBySale[s.id] || [];
    const paid = entries
      .filter((e) => e.type === "PAYMENT_RECEIVED")
      .reduce((sum, e) => sum + e.amount, 0);
    const balance = s.total - paid;
    return { ...s, paid, balance };
  });

  // Map saleId -> saleUuid for payments tab
  const saleMap = customerSales.reduce((map, s) => {
    map[s.id] = s.saleUuid;
    return map;
  }, {});

  // Filter payments from ledger
  const payments = ledger.filter((e) => e.type === "PAYMENT_RECEIVED");

  // Totals
  const totalSales = salesWithBalances.reduce((sum, s) => sum + s.total, 0);
  const totalPaid = salesWithBalances.reduce((sum, s) => sum + s.paid, 0);
  const totalBalance = totalSales - totalPaid;

  const totalDebit = ledger.reduce((sum, e) => {
    if (
      e.type === "SALE" ||
      e.type === "PAYMENT_ISSUED" ||
      (e.type === "ADJUSTMENT" && e.amount >= 0)
    )
      return sum + Math.abs(e.amount);
    return sum;
  }, 0);

  const totalCredit = ledger.reduce((sum, e) => {
    if (
      e.type === "PURCHASE" ||
      e.type === "PAYMENT_RECEIVED" ||
      e.type === "RETURN" ||
      (e.type === "ADJUSTMENT" && e.amount < 0)
    )
      return sum + Math.abs(e.amount);
    return sum;
  }, 0);

  return (
    <>
      <Modal size="xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customer Details</ModalHeader>
          <CloseBtn onClick={onClose} />
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
                <strong>Total Sales:</strong> {customerSales.length}
              </Text>
            </VStack>

            <Tabs>
              <TabList>
                <Tab>Sales</Tab>
                <Tab>Payments</Tab>
                <Tab>Statement</Tab>
              </TabList>

              <TabPanels>
                {/* Sales Tab */}
                <TabPanel>
                  {customerSales.length === 0 ? (
                    <Text>No sales for this customer</Text>
                  ) : (
                    <Box flex="1" h="300px" overflowY="auto" overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Sale #
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Date
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Total
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Paid
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Balance
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {salesWithBalances.map((s) => (
                            <Tr key={s.id}>
                              <Td>
                                <Link onClick={() => setSelectedSaleId(s.id)}>
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
                    </Box>
                  )}
                </TabPanel>

                {/* Payments Tab */}
                <TabPanel>
                  {payments.length === 0 ? (
                    <Text>No payments for this customer</Text>
                  ) : (
                    <Box flex="1" h="300px" overflowY="auto" overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Pay #
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Date
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Inv #
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Amount
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Method
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {payments.map((entry) => {
                            // Only include entries that are linked to a ReceivedPayment
                            if (!entry.receivedPaymentId) return null;

                            return (
                              <Tr key={entry.receivedPaymentId}>
                                <Td>
                                  <Link
                                    onClick={() =>
                                      setSelectedPayment(
                                        entry.receivedPaymentId
                                      )
                                    }
                                  >
                                    {entry.receivedPayment?.paymentNumber ||
                                      entry.receivedPaymentId.slice(0, 7)}
                                  </Link>
                                </Td>
                                <Td>
                                  {new Date(
                                    entry.createdAt
                                  ).toLocaleDateString()}
                                </Td>
                                <Td>
                                  {entry.saleId ? (
                                    <Link
                                      onClick={() =>
                                        setSelectedSaleId(entry.saleId)
                                      }
                                    >
                                      {saleMap[entry.saleId]}
                                    </Link>
                                  ) : (
                                    "N/A"
                                  )}
                                </Td>
                                <Td>{entry.amount.toFixed(2)}</Td>
                                <Td>{entry.method || "N/A"}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </TabPanel>

                {/* Ledger Adjustments / Full Statement Tab */}
                <TabPanel>
                  {ledger.length === 0 ? (
                    <Text>No ledger entries for this customer</Text>
                  ) : (
                    <Box flex="1" h="300px" overflowY="auto" overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Entry #
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Date
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Type
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Invoice / Purchase #
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                              isNumeric
                            >
                              Debit
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                              isNumeric
                            >
                              Credit
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg="gray.100"
                              zIndex={1}
                            >
                              Notes
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {ledger.map((entry) => {
                            let debit = 0;
                            let credit = 0;

                            switch (entry.type) {
                              case "SALE":
                                debit = entry.amount;
                                break;
                              case "PURCHASE":
                              case "PAYMENT_RECEIVED":
                              case "RETURN":
                                credit = entry.amount;
                                break;
                              case "PAYMENT_ISSUED":
                                debit = entry.amount;
                                break;
                              case "ADJUSTMENT":
                                if (entry.amount >= 0) debit = entry.amount;
                                else credit = -entry.amount;
                                break;
                              default:
                                break;
                            }

                            const balance = debit - credit;

                            return (
                              <Tr key={entry.id}>
                                <Td>
                                  {["PAYMENT_RECEIVED"].includes(entry.type) &&
                                  entry.receivedPaymentId ? (
                                    <Link
                                      onClick={() =>
                                        setSelectedPayment(
                                          entry.receivedPaymentId
                                        )
                                      }
                                    >
                                      {entry.receivedPayment?.paymentNumber ||
                                        entry.receivedPaymentId.slice(0, 7)}
                                    </Link>
                                  ) : ["PAYMENT_ISSUED"].includes(entry.type) &&
                                    entry.issuedPaymentId ? (
                                    <Link
                                      onClick={() =>
                                        setSelectedPayment(
                                          entry.issuedPaymentId
                                        )
                                      }
                                    >
                                      {entry.issuedPayment?.paymentNumber ||
                                        entry.issuedPaymentId.slice(0, 7)}
                                    </Link>
                                  ) : ["SALE"].includes(entry.type) &&
                                    entry.saleId ? (
                                    <Link
                                      onClick={() =>
                                        setSelectedSaleId(entry.saleId)
                                      }
                                    >
                                      {entry.sale?.saleUuid ||
                                        entry.saleId.slice(0, 7)}
                                    </Link>
                                  ) : ["PURCHASE"].includes(entry.type) &&
                                    entry.purchaseId ? (
                                    <Link>
                                      {entry.purchase?.purchaseUuid ||
                                        entry.purchaseId.slice(0, 7)}
                                    </Link>
                                  ) : ["RETURN", "ADJUSTMENT"].includes(
                                      entry.type
                                    ) ? (
                                    entry.id.slice(0, 7)
                                  ) : (
                                    entry.id.slice(0, 7)
                                  )}
                                </Td>
                                <Td>
                                  {new Date(
                                    entry.createdAt
                                  ).toLocaleDateString()}
                                </Td>
                                <Td>{entry.type}</Td>
                                <Td>
                                  {entry.saleId
                                    ? saleMap[entry.saleId]
                                    : entry.purchaseId || "—"}
                                </Td>
                                <Td
                                  isNumeric
                                  color={balance < 0 ? "red.500" : "inherit"}
                                >
                                  {debit.toFixed(2)}
                                </Td>
                                <Td
                                  isNumeric
                                  color={balance < 0 ? "red.500" : "inherit"}
                                >
                                  {credit.toFixed(2)}
                                </Td>
                                <Td>{entry.description || "—"}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                        <Tfoot>
                          <Tr fontWeight="bold">
                            <Td>Total</Td>
                            <Td></Td>
                            <Td></Td>
                            <Td></Td>
                            <Td
                              isNumeric
                              color={
                                totalDebit - totalCredit < 0
                                  ? "red.500"
                                  : "inherit"
                              }
                            >
                              {totalDebit.toFixed(2)}
                            </Td>
                            <Td
                              isNumeric
                              color={
                                totalDebit - totalCredit < 0
                                  ? "red.500"
                                  : "inherit"
                              }
                            >
                              {totalCredit.toFixed(2)}
                            </Td>
                            <Td></Td>
                          </Tr>
                        </Tfoot>
                      </Table>
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Invoice Details Modal */}
      {selectedSaleId && (
        <InvoiceDetails
          saleId={selectedSaleId}
          isOpen={Boolean(selectedSaleId)}
          onClose={() => setSelectedSaleId(null)}
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
