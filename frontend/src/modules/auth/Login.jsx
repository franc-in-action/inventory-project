import { useState, useEffect } from "react";
import {
  Box,
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
    <Flex
      bg="#004E98"
      minH="100vh"
      align="center"
      justify="center"
      fontFamily="MS Sans Serif"
    >
      <Box
        id="window"
        w="450px"
        border="2px solid blue"
        boxShadow="0 0 10px #9E9E9E"
      >
        {/* Top Bar */}
        <Box
          id="topBar"
          bgGradient="linear(to-b, #2B90FF, #0055EA, #026AFE)"
          color="white"
          fontWeight="bold"
          letterSpacing="0.5px"
          fontSize="1em"
          p="2px 0"
        >
          Log On to Windows
        </Box>

        {/* Logo Area */}
        <Box
          id="logoArea"
          bgGradient="linear(to-r, #6286E1, #6286E1 , #9FBBF6, #7899E9)"
          position="relative"
          textAlign="center"
          color="white"
          py={4}
        >
          <canvas
            id="canvas"
            width="80"
            height="100"
            style={{
              position: "absolute",
              top: 35,
              left: 250,
              transform: "rotate(-5deg)",
            }}
          ></canvas>
          <Box id="section">
            <Text
              id="microsoftTop"
              fontSize="0.7em"
              mt="-8px"
              mb="-27px"
              ml="-60px"
            >
              Microsoft
            </Text>
            <Text>
              <span
                id="windowSpan"
                style={{
                  fontSize: "2em",
                  fontWeight: "bold",
                  color: "#EFF3FD",
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Windows
                <sup style={{ color: "#F75A14", fontSize: "0.7em" }}>xp</sup>
              </span>
            </Text>
            <Text id="proBottom" mt="-22px">
              Professional
            </Text>
          </Box>
          <Box as="nav" mt={2}>
            <Text fontSize="0.7em" mt="-15px" color="white">
              Copyright © 1985-2001
            </Text>
            <Text fontSize="0.7em" mt="-15px" color="white">
              Microsoft Corporation{" "}
              <span
                id="rightSpan"
                style={{
                  float: "right",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  letterSpacing: "-0.5px",
                  fontSize: "1.1em",
                }}
              >
                Microsoft
              </span>
            </Text>
          </Box>
        </Box>

        {/* Orange Bar */}
        <Box
          id="orangeBar"
          bgGradient="linear(to-r, #6D8CE1, #6B81CA, #B48E7E, #E89148, #E89148, #B48E7E, #6B87D5)"
          h="9px"
          mt="-11px"
        ></Box>

        {/* Form */}
        <Box
          as="form"
          bg="#ECE9D8"
          p={4}
          onSubmit={handleSubmit}
          fontSize="0.75em"
          letterSpacing="0.5px"
        >
          <VStack spacing={3} align="stretch">
            <Text className="specialAlign" pl="10px">
              User name:
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                w="280px"
                ml="10px"
                required
              />
            </Text>
            <Text className="specialAlign" pl="10px">
              Password:
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                w="280px"
                ml="10px"
                required
              />
            </Text>

            <Flex gap={2}>
              <Button
                id="firstButton"
                type="submit"
                isLoading={loading}
                ml="120px"
                w="95px"
                borderRadius="5%"
              >
                OK
              </Button>
              <Button w="95px" borderRadius="5%">
                Cancel
              </Button>
              <Button w="95px" borderRadius="5%">
                Options &gt;&gt;
              </Button>
            </Flex>

            {error && <Text color="red.500">{error}</Text>}
          </VStack>
        </Box>
      </Box>
    </Flex>
  );
}
