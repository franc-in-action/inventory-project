import { useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Link,
  ButtonGroup,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { FiPrinter } from "react-icons/fi";
import ReturnDetail from "./ReturnDetail.jsx";
import { useSales } from "../sales/contexts/SalesContext.jsx";
import { formatReceipt } from "../sales/salesApi.js";

export default function ReturnList({ returns, onEdit, onDelete }) {
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { getReturnById } = useSales();

  const openDetail = (id) => {
    setSelectedReturnId(id);
    setDetailModalOpen(true);
  };

  const closeDetail = () => {
    setSelectedReturnId(null);
    setDetailModalOpen(false);
  };

  const handlePrint = (id) => {
    const returnData = getReturnById(id);
    if (!returnData) return alert("Return data not found");

    const receiptText = formatReceipt(
      returnData,
      {},
      { cashier: "System" },
      true
    );

    // Open in a new window for printing
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<pre>" + receiptText + "</pre>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <Table>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Customer</Th>
            <Th>Items</Th>
            <Th>Total</Th>
            <Th>Created At</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {returns.map((r) => (
            <Tr key={r.id}>
              <Td>
                <Link onClick={() => openDetail(r.id)}>{r.id}</Link>
              </Td>
              <Td>{r.customer?.name || "Walk-in"}</Td>
              <Td>{r.items?.length || 0}</Td>
              <Td>
                {r.items
                  ?.reduce((sum, i) => sum + i.qty * i.price, 0)
                  .toFixed(2)}
              </Td>
              <Td>{new Date(r.createdAt).toLocaleString()}</Td>
              <Td>
                <ButtonGroup>
                  <IconButton
                    icon={<EditIcon />}
                    aria-label="Edit"
                    onClick={() => onEdit(r.id)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    variant="danger"
                    aria-label="Delete"
                    onClick={async () => await onDelete(r.id)}
                  />
                  <IconButton
                    icon={<FiPrinter />}
                    aria-label="Print Receipt"
                    onClick={() => handlePrint(r.id)}
                  />
                </ButtonGroup>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {selectedReturnId && (
        <ReturnDetail
          returnId={selectedReturnId}
          isOpen={detailModalOpen}
          onClose={closeDetail}
        />
      )}
    </>
  );
}
