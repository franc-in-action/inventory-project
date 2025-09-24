import { extendTheme } from "@chakra-ui/react";
import Tabs from "./components/tabs";
import Button from "./components/button";
import Input from "./components/input";

const theme = extendTheme({
  components: {
    Tabs,
    Button,
    Input,
  },
});

export default theme;
