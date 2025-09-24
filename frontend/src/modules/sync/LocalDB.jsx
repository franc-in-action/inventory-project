import { useEffect, useState } from "react";
import { Box, Heading, Button, VStack, Text, Divider } from "@chakra-ui/react";
import Header from "../../components/Header";

export default function LocalDB() {
  const [dbState, setDbState] = useState({ products: [], stockMovements: [] });
  const [syncing, setSyncing] = useState(false);

  const loadDb = async () => {
    // Call into Electron main via preload (ipcRenderer)
    const data = await window.electronAPI.getLocalDbState();
    setDbState(data);
  };

  const handleSync = async () => {
    setSyncing(true);
    await window.electronAPI.syncNow(); // trigger sync process
    await loadDb(); // reload state after sync
    setSyncing(false);
  };

  useEffect(() => {
    loadDb();
  }, []);

  return (
    <Box>
      <Header />
      <Heading>Local DB State</Heading>
      <Button onClick={handleSync} isLoading={syncing}>
        Sync Now
      </Button>

      <Divider />

      <VStack>
        <Box>
          <Heading>Products</Heading>
          {dbState.products.length === 0 ? (
            <Text>No products in local DB</Text>
          ) : (
            dbState.products.map((p) => (
              <Text key={p.id}>
                {p.sku} - {p.name} (${p.price})
              </Text>
            ))
          )}
        </Box>

        <Box>
          <Heading>Stock Movements</Heading>
          {dbState.stockMovements.length === 0 ? (
            <Text>No stock movements</Text>
          ) : (
            dbState.stockMovements.map((m) => (
              <Text key={m.id}>
                {m.type} {m.quantity} @ {m.createdAt}
              </Text>
            ))
          )}
        </Box>
      </VStack>
    </Box>
  );
}
