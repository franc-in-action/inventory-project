import { useState } from "react";
import {
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
      <Table>
        <Thead>
          <Tr>
            <Th>Product</Th>
            <Th>Location</Th>
            <Th>Quantity</Th>
            <Th>Actions</Th>
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
