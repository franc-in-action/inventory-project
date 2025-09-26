import { extendTheme } from "@chakra-ui/react";

import Flex from "./components/flex";
import Box from "./components/box";
import Tabs from "./components/tabs";
import Button from "./components/button";
import Input from "./components/input";
import Heading from "./components/heading";
import Text from "./components/text";
import ButtonGroup from "./components/buttongroup";
import Table from "./components/table";
import Card from "./components/card";

// Define a custom color palette
const colors = {
  brand: {
    50: "#e3f2fd",
    100: "#bbdefb",
    200: "#90caf9",
    300: "#64b5f6",
    400: "#42a5f5",
    500: "#1E88E5", // primary brand color
    600: "#1976d2",
    700: "#1565c0",
    800: "#0d47a1",
    900: "#0b3c91",
  },
};

// Theme config for color mode
const config = {
  initialColorMode: "light", // default mode
  useSystemColorMode: true, // respect system preference
};

const theme = extendTheme({
  config,
  colors,
  components: {
    Flex,
    Box,
    Tabs,
    Button,
    Input,
    Heading,
    Text,
    ButtonGroup,
    Table,
    Card,
    Modal,
  },
});

export default theme;
