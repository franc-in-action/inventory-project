import { useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  ButtonGroup,
} from "@chakra-ui/react";
import { EditIcon, ViewIcon } from "@chakra-ui/icons";
import StockDetail from "./StockDetail.jsx";

export default function StockList({ stocks, onEdit }) {
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const openDetails = (productId, locationId) => {
    setSelected({ productId, locationId });
    setDetailsOpen(true);
  };

  return (
    <>
      <Box flex="1" h="300px" overflowY="auto" overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                Product
              </Th>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                Location
              </Th>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                Quantity
              </Th>
              <Th position="sticky" top={0} bg="gray.100" zIndex={1}>
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {stocks.map((s) => (
              <Tr key={`${s.productId}-${s.locationId}`}>
                <Td>{s.productName}</Td>
                <Td>{s.locationName}</Td>
                <Td>{s.quantity}</Td>
                <Td>
                  <ButtonGroup>
                    <IconButton
                      icon={<ViewIcon />}
                      aria-label="View"
                      onClick={() => openDetails(s.productId, s.locationId)}
                    />
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit"
                      onClick={() => onEdit(s.productId, s.locationId)}
                    />
                  </ButtonGroup>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {selected && (
        <StockDetail
          productId={selected.productId}
          locationId={selected.locationId}
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </>
  );
}
