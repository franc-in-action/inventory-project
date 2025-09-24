import { extendTheme } from "@chakra-ui/react";

import Flex from "./components/flex";
import Box from "./components/box";
import Tabs from "./components/tabs";
import Button from "./components/button";
import Input from "./components/input";
import Heading from "./components/heading";
import Text from "./components/text";

const theme = extendTheme({
  components: {
    Flex,
    Box,
    Tabs,
    Button,
    Input,
    Heading,
    Text,
  },
});

export default theme;
