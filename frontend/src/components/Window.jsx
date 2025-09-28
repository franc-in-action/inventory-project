// Window.jsx
import { Box, Button, Flex, Text } from "@chakra-ui/react";

export function Window({
  title,
  children,
  onClose,
  onMinimize,
  onMaximize,
  ...props
}) {
  return (
    <Box
      position="absolute"
      top="3rem"
      left="3rem"
      width="400px"
      bg="gray.200"
      border="2px solid #000"
      boxShadow="2px 2px #fff, -2px -2px #aaa"
      {...props}
    >
      {/* Title Bar */}
      <Flex
        className="title-bar"
        align="center"
        justify="space-between"
        bg="blue.500"
        color="white"
        px={2}
        py={1}
        borderBottom="2px solid #000"
      >
        <Text fontWeight="bold" className="title-bar-text">
          {title}
        </Text>
        <Flex className="title-bar-controls" gap={1}>
          <Button size="xs" aria-label="Minimize" onClick={onMinimize}>
            _
          </Button>
          <Button size="xs" aria-label="Maximize" onClick={onMaximize}>
            ▢
          </Button>
          <Button size="xs" aria-label="Close" onClick={onClose}>
            X
          </Button>
        </Flex>
      </Flex>

      {/* Window Body */}
      <Box className="window-body" p={3}>
        {children}
      </Box>
    </Box>
  );
}
