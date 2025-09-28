import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  VStack,
  HStack,
  Text,
  Divider,
  NumberInput,
  NumberInputField,
  Select,
  IconButton,
  Switch,
  FormControl,
  FormLabel,
  ButtonGroup,
  Box,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

import ComboBox from "../../components/ComboBox.jsx";
import { useProducts } from "../products/contexts/ProductsContext.jsx";
import { useCustomers } from "../customers/contexts/CustomersContext.jsx";
import { useSales } from "./contexts/SalesContext.jsx";
import { fetchNextSaleNumber } from "./salesApi.js";
import InvoiceDetails from "./InvoiceDetails.jsx";

export default function InvoiceForm({ isOpen, onClose, saleData = null }) {
  const { products, stockMap } = useProducts();
  const { customers, reloadCustomers, fetchCustomerById, createCustomer } =
    useCustomers();
  const {
    addSale,
    previewSale,
    previewSaleData,
    isPreviewOpen,
    closePreviewSale,
    getSaleForEdit,
  } = useSales();

  const [editingSale, setEditingSale] = useState(null);
  const [saleUuid, setSaleUuid] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState({ amount: 0, method: "cash" });
  const [isCashSale, setIsCashSale] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productId: "",
    qty: 1,
    price: 0,
  });

  // Prefill form if editing
  useEffect(() => {
    if (!isOpen) return;

    if (saleData) {
      const data =
        saleData.id === "preview"
          ? saleData
          : getSaleForEdit(saleData.id) || saleData;

      setEditingSale(data);
      setSaleUuid(data.saleUuid || "");
      setSelectedCustomer(data.customer || null);
      setCart(data.items || []);
      setPayment(data.payment || { amount: 0, method: "cash" });
      setIsCashSale(data.payment?.method === "cash");
    } else {
      setEditingSale(null);
      (async () => {
        try {
          setSaleUuid(await fetchNextSaleNumber());
        } catch {
          setSaleUuid("N/A");
        }
        reloadCustomers();
      })();
      setCart([]);
      setSelectedCustomer(null);
      setCustomerData(null);
      setPayment({ amount: 0, method: "cash" });
      setIsCashSale(false);
    }
  }, [isOpen, saleData, getSaleForEdit, reloadCustomers]);

  // Load selected customer data
  useEffect(() => {
    if (!selectedCustomer) return setCustomerData(null);
    fetchCustomerById(selectedCustomer.id)
      .then(setCustomerData)
      .catch(() => setCustomerData(null));
  }, [selectedCustomer, fetchCustomerById]);

  // Enriched cart
  const enrichedCart = useMemo(
    () =>
      cart.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          ...item,
          price: item.price || product?.price || 0,
          locationId: product?.locationId || "",
          stockQty: stockMap[product?.id] || 0,
        };
      }),
    [cart, products, stockMap]
  );

  const totalAmount = useMemo(
    () => enrichedCart.reduce((sum, i) => sum + i.qty * i.price, 0),
    [enrichedCart]
  );

  useEffect(() => {
    if (isCashSale) setPayment((prev) => ({ ...prev, amount: totalAmount }));
  }, [isCashSale, totalAmount]);

  const handleAddProduct = () => {
    if (!newProduct.productId || newProduct.qty <= 0) return;
    setCart((prev) => [...prev, newProduct]);
    setNewProduct({ productId: "", qty: 1, price: 0 });
  };

  const handleCartChange = (index, field, value) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const removeCartRow = (index) =>
    setCart((prev) => prev.filter((_, i) => i !== index));

  const handlePreview = () => {
    const sale = {
      saleUuid,
      customer: selectedCustomer,
      items: enrichedCart,
      payment,
      total: totalAmount,
    };
    previewSale(sale);
  };

  const handleSubmit = async (status = "complete") => {
    if (!selectedCustomer || enrichedCart.length === 0)
      return alert("Select customer and add at least one product");

    const locationId = enrichedCart[0].locationId;
    if (enrichedCart.some((i) => i.locationId !== locationId))
      return alert("All products must belong to the same location");

    const insufficient = enrichedCart.find((i) => i.qty > i.stockQty);
    if (insufficient) {
      const product = products.find((p) => p.id === insufficient.productId);
      return alert(`Insufficient stock for "${product?.name}"`);
    }

    if (status === "draft") {
      await addSale({
        saleUuid,
        locationId,
        customerId: selectedCustomer?.id || null,
        items: enrichedCart.map(({ productId, qty, price }) => ({
          productId,
          qty,
          price,
        })),
        payment: null,
        total: totalAmount,
        status: "PENDING",
        notes: "Customer will return later",
      });
      onClose();
      return;
    }

    setLoading(true);
    try {
      await addSale({
        id: editingSale?.id,
        saleUuid,
        locationId,
        customerId: selectedCustomer.id,
        items: enrichedCart.map(({ productId, qty, price }) => ({
          productId,
          qty,
          price,
        })),
        payment,
        total: totalAmount,
        status,
      });

      setCart([]);
      setSelectedCustomer(null);
      setCustomerData(null);
      setPayment({ amount: 0, method: "cash" });
      setIsCashSale(false);
      setSaleUuid("");
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal size="6xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingSale ? "Editing Sale: " : "New Invoice #: "} {saleUuid}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingSale && (
              <Text fontWeight="bold" mb={2}>
                You are editing an existing sale
              </Text>
            )}

            {/* Top Row */}
            <HStack spacing={4} mb={4} align="flex-start">
              {/* Add Product */}
              <VStack align="stretch" spacing={2} flex={2}>
                <Text fontWeight="bold">Add Product</Text>
                <Select
                  placeholder="Select Product"
                  value={newProduct.productId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedProduct = products.find(
                      (p) => p.id === selectedId
                    );
                    setNewProduct((prev) => ({
                      ...prev,
                      productId: selectedId,
                      price: selectedProduct?.price || 0,
                    }));
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {stockMap[p.id] || 0})
                    </option>
                  ))}
                </Select>
                <NumberInput
                  min={1}
                  value={newProduct.qty}
                  onChange={(v) =>
                    setNewProduct((prev) => ({ ...prev, qty: Number(v) }))
                  }
                >
                  <NumberInputField placeholder="Qty" />
                </NumberInput>
                <NumberInput
                  min={0}
                  value={newProduct.price}
                  onChange={(v) =>
                    setNewProduct((prev) => ({ ...prev, price: Number(v) }))
                  }
                >
                  <NumberInputField placeholder="Price" />
                </NumberInput>
                <Button leftIcon={<AddIcon />} onClick={handleAddProduct}>
                  Add to Cart
                </Button>
              </VStack>

              {/* Customer */}
              <VStack align="stretch" spacing={2} flex={1}>
                <Text fontWeight="bold">Customer Options</Text>
                <Button onClick={() => alert("Implement New Customer Modal")}>
                  New Customer
                </Button>
                <ComboBox
                  items={customers}
                  selectedItemId={selectedCustomer?.id}
                  placeholder="Search Customer"
                  onSelect={setSelectedCustomer}
                  createNewItem={async (name) => {
                    const newCust = await createCustomer({ name });
                    reloadCustomers();
                    return newCust;
                  }}
                  itemToString={(c) => c.name}
                />
                {customerData && (
                  <Text>
                    Credit Limit: {customerData.credit_limit.toFixed(2)},
                    Balance: {customerData.balance.toFixed(2)}
                  </Text>
                )}
                <FormControl>
                  <FormLabel htmlFor="cash-sale">Cash Sale</FormLabel>
                  <Switch
                    id="cash-sale"
                    isChecked={isCashSale}
                    onChange={(e) => setIsCashSale(e.target.checked)}
                  />
                </FormControl>
              </VStack>

              {/* Actions */}
              <VStack spacing={2} flex={1}>
                <Button onClick={handlePreview}>Preview Sale</Button>
                <Button onClick={() => handleSubmit("complete")}>
                  {editingSale ? "Update Sale" : "Complete Sale"}
                </Button>
              </VStack>
            </HStack>

            <Divider mb={4} />

            {/* Bottom Row */}
            <HStack spacing={4}>
              {/* Cart */}
              <VStack align="stretch" spacing={2} flex={3}>
                <Text fontWeight="bold">Cart Items</Text>
                {enrichedCart.length === 0 ? (
                  <Text>No items in cart</Text>
                ) : (
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                          Product
                        </Th>
                        <Th isNumeric>Qty</Th>
                        <Th isNumeric>Price</Th>
                        <Th isNumeric>Total</Th>
                        <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                          Actions
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {enrichedCart.map((item, idx) => {
                        const product = products.find(
                          (p) => p.id === item.productId
                        );
                        return (
                          <Tr key={idx}>
                            <Td>{product?.name || item.productId}</Td>
                            <Td isNumeric>
                              <NumberInput
                                size="sm"
                                min={1}
                                value={item.qty}
                                onChange={(v) =>
                                  handleCartChange(idx, "qty", Number(v))
                                }
                              >
                                <NumberInputField />
                              </NumberInput>
                            </Td>
                            <Td isNumeric>
                              <NumberInput
                                size="sm"
                                min={0}
                                value={item.price}
                                onChange={(v) =>
                                  handleCartChange(idx, "price", Number(v))
                                }
                              >
                                <NumberInputField />
                              </NumberInput>
                            </Td>
                            <Td isNumeric>
                              {(item.qty * item.price).toFixed(2)}
                            </Td>
                            <Td>
                              <IconButton
                                size="sm"
                                icon={<DeleteIcon />}
                                onClick={() => removeCartRow(idx)}
                                aria-label="Remove item"
                              />
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                )}
              </VStack>

              {/* Summary */}
              <Box flex={1}>
                <VStack align="stretch" spacing={2}>
                  <Text fontWeight="bold">Order Summary</Text>
                  <Text>Total: {totalAmount.toFixed(2)}</Text>
                  <Text>Tax (10%): {(totalAmount * 0.1).toFixed(2)}</Text>
                  <Text fontWeight="bold">
                    Grand Total: {(totalAmount * 1.1).toFixed(2)}
                  </Text>
                </VStack>
              </Box>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup>
              <Button onClick={() => setCart([])}>Delete</Button>
              <Button onClick={() => handleSubmit("draft")}>
                Save as Draft
              </Button>
              <Button onClick={() => handleSubmit("edit")}>
                {editingSale ? "Update Sale" : "Edit"}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {previewSaleData && (
        <InvoiceDetails
          saleId={previewSaleData.id}
          isOpen={isPreviewOpen}
          onClose={closePreviewSale}
        />
      )}
    </>
  );
}
