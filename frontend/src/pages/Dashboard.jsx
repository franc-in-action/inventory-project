import { Box, Heading, Button, Flex } from "@chakra-ui/react";

export default function Dashboard() {
  return (
    <Flex
      p={{ base: 4, md: 6 }}
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      minH="60vh"
    >
      <Heading mb={6}>Dashboard</Heading>
      <Button
        colorScheme="blue"
        onClick={() => (window.location.href = "/products")}
      >
        Go to Products
      </Button>
    </Flex>
  );
}
