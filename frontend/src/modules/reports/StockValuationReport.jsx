import { useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useReports } from "./contexts/ReportsContext.jsx";

export default function StockValuationReport({ period, locationId }) {
  const { report, loading, loadStockValuation } = useReports();

  useEffect(() => {
    loadStockValuation({ period, locationId });
  }, [period, locationId, loadStockValuation]);

  if (loading) return <Spinner />;
  if (!report || !report.data?.length)
    return <Text>No data for the selected period.</Text>;

  return (
    <Box overflowX="auto">
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Period</Th>
            <Th isNumeric>Valuation</Th>
          </Tr>
        </Thead>
        <Tbody>
          {report.data.map((row) => (
            <Tr key={row.period}>
              <Td>{row.period}</Td>
              <Td isNumeric>{row.valuation.toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
