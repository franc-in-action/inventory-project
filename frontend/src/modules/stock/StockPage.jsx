import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  Spacer,
  Input,
  Button,
  ButtonGroup,
  Select,
  useToast,
} from "@chakra-ui/react";
import {
  AddIcon,
  ViewIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { useStock } from "./contexts/StockContext.jsx";
import StockList from "./StockList.jsx";
import StockForm from "./StockForm.jsx";
import { useNavigate } from "react-router-dom";

export default function StockPage() {
  const {
    stocks,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    reloadStocks,
  } = useStock();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

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
    <Flex direction="column" p={4}>
      <Flex mb={2}>
        <Box p="2">
          <Heading size="md">Manage stock and inventory</Heading>
        </Box>
        <Spacer />
        <ButtonGroup>
          <Button
            variant="outline"
            leftIcon={<ViewIcon />}
            onClick={() => navigate("/reports/stock")}
          >
            View Reports
          </Button>
          <Button
            variant="outline"
            leftIcon={<ViewIcon />}
            onClick={() => navigate("/stock-adjustments")}
          >
            View Adjustments
          </Button>
        </ButtonGroup>
      </Flex>

      <Flex mb={4} w="100%" align="center">
        <Input
          placeholder="Search products or locations..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          mr={2}
        />
        <Select
          value={pageSize}
          onChange={(e) => setPageSize(parseInt(e.target.value))}
          w="120px"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </Select>
      </Flex>

      {loading ? (
        <Box>Loading stock...</Box>
      ) : (
        <>
          <StockList stocks={filteredStocks} onEdit={openEditModal} />

          <Flex mt={4} justify="center" align="center">
            <Button
              leftIcon={<ChevronLeftIcon />}
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              mr={2}
            >
              Previous
            </Button>
            <Box mx={2}>
              Page {page} of {totalPages}
            </Box>
            <Button
              rightIcon={<ChevronRightIcon />}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              ml={2}
            >
              Next
            </Button>
          </Flex>
        </>
      )}

      {modalOpen && (
        <StockForm
          productId={editing?.productId}
          locationId={editing?.locationId}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={reloadStocks}
        />
      )}
    </Flex>
  );
}
