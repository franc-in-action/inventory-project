import { extendTheme } from "@chakra-ui/react";
import Flex from "./components/flex";
import Tabs from "./components/tabs";
import Button from "./components/button";
import Input from "./components/input";

const theme = extendTheme({
  components: {
    Flex,
    Tabs,
    Button,
    Input,
  },
});

export default theme;
