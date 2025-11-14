import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Flex,
  useToast,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, login, getDefaultPage } from "./authApi.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const defaultPage = getDefaultPage();
    if (isLoggedIn() && window.location.pathname !== defaultPage) {
      navigate(defaultPage, { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login({ email, password });

    if (result.success) {
      toast({
        title: "Login successful",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate(getDefaultPage(), { replace: true });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Flex bg="gray.50" minH="100vh" align="center" justify="center" p={4}>
      <Box w="400px" bg="white" p={6} borderRadius="md" boxShadow="md">
        <Heading size="md" textAlign="center" mb={6}>
          Log In
        </Heading>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" mb={1}>
                Email
              </Text>
              <Input
                type="text"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Box>

            <Box>
              <Text fontSize="sm" mb={1}>
                Password
              </Text>
              <Input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Box>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              width="100%"
            >
              Login
            </Button>

            {error && (
              <Text color="red.500" textAlign="center" fontSize="sm">
                {error}
              </Text>
            )}
          </VStack>
        </Box>
      </Box>
    </Flex>
  );
}
