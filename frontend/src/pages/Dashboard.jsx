// Dashboard.jsx

import { Box, Heading, Button } from "@chakra-ui/react";

export default function Dashboard() {
  return (
    <Box p={6}>
      <Heading mb={4}>Dashboard</Heading>
      <Button onClick={() => (window.location.href = "/products")}>
        Go to Products
      </Button>
    </Box>
  );
}
