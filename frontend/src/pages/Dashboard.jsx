import { Box, Heading, Button, Flex, Text } from "@chakra-ui/react";
import { getUserFromToken } from "../modules/auth/authApi.js";

export default function Dashboard() {
  const user = getUserFromToken();

  return (
    <Flex
      p={{ base: 4, md: 6 }}
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      minH="60vh"
      gap={4}
    >
      <Heading mb={2}>Dashboard</Heading>
      {user && (
        <Text>
          Welcome, {user.name || "User"} ({user.role})
        </Text>
      )}
      <Button
        colorScheme="blue"
        onClick={() => (window.location.href = "/products")}
      >
        Go to Products
      </Button>
      <Button
        colorScheme="teal"
        onClick={() => (window.location.href = "/sales")}
      >
        Go to Sales
      </Button>
      <Button
        colorScheme="purple"
        onClick={() => (window.location.href = "/purchases")}
      >
        Go to Purchases
      </Button>
      <Button
        colorScheme="orange"
        onClick={() => (window.location.href = "/locations")}
      >
        Go to Locations
      </Button>
    </Flex>
  );
}
