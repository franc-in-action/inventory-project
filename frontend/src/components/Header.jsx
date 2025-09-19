import { Box, Flex, Spacer, Button, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear token
    navigate("/login"); // redirect to login
  };

  return (
    <Box bg="blue.500" color="white" p={4} mb={6}>
      <Flex align="center">
        <Heading size="md">Inventory App</Heading>
        <Spacer />
        <Button colorScheme="red" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>
    </Box>
  );
}
