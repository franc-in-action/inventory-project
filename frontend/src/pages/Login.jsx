import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  Text,
  Flex,
} from "@chakra-ui/react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        if (window.electronAPI) {
          window.electronAPI.authSuccess(data.token);
        }
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex p={6} minH="100vh" align="center" justify="center" bg="gray.50">
      <Box
        w="full"
        maxW="sm"
        bg="white"
        p={{ base: 6, md: 8 }}
        borderRadius="lg"
        boxShadow="md"
      >
        <Heading mb={6} textAlign="center">
          Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Input
              placeholder="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              isLoading={loading}
              colorScheme="blue"
              w="full"
            >
              Login
            </Button>
            {error && <Text color="red.500">{error}</Text>}
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}
