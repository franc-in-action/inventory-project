import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Flex,
  Spacer,
  Button,
  Input,
  useToast,
  ButtonGroup,
} from "@chakra-ui/react";
import { AddIcon, ViewIcon } from "@chakra-ui/icons";
import { fetchTotalStockForProducts } from "./stockApi.js";
import StockList from "./StockList.jsx";
import StockForm from "./StockForm.jsx";
import { apiFetch } from "../../utils/commonApi.js";
import { useNavigate } from "react-router-dom"; // <- for navigation

export default function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate(); // <- initialize navigation

  const loadStocks = async () => {
    try {
      const res = await apiFetch("/stock/all");
      setStocks(res);
    } catch (err) {
      console.error(err);
      toast({ status: "error", description: "Failed to load stocks" });
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const openEditModal = (productId, locationId) => {
    setEditing({ productId, locationId });
    setModalOpen(true);
  };

  const filteredStocks = stocks.filter(
    (s) =>
      s.productName.toLowerCase().includes(filter.toLowerCase()) ||
      s.locationName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box>
      <Flex minWidth="max-content" alignItems="center" gap="2">
        <Box p="2">
          <Heading size="md">Stock Management</Heading>
        </Box>
        <Spacer />
        <ButtonGroup>
          <Button
            variant="primary"
            leftIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
          >
            Add Stock
          </Button>
          {/* Button to go to Stock Adjustments page */}
          <Button
            variant="outline"
            leftIcon={<ViewIcon />}
            onClick={() => navigate("/stock-adjustments")}
          >
            View Adjustments
          </Button>
        </ButtonGroup>
      </Flex>

      <Input
        placeholder="Search products or locations..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        my={4}
      />

      <StockList stocks={filteredStocks} onEdit={openEditModal} />

      {modalOpen && (
        <StockForm
          productId={editing?.productId}
          locationId={editing?.locationId}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={loadStocks}
        />
      )}
    </Box>
  );
}
