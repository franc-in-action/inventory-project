import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  Text,
  Flex,
  useToast,
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
    <Flex>
      <Box>
        <Heading>Login</Heading>
        <form onSubmit={handleSubmit}>
          <VStack>
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
            <Button type="submit" isLoading={loading}>
              Login
            </Button>
            {error && <Text>{error}</Text>}
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}
