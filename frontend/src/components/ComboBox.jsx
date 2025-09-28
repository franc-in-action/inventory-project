import { Box, Input, VStack, Text } from "@chakra-ui/react";
import { useCombobox } from "downshift";

export default function ComboBox({
  items = [],
  selectedItemId,
  placeholder = "",
  onSelect,
  createNewItem,
  itemToString = (item) => (item ? item.name : ""),
}) {
  const sortedItems = [...items].sort((a, b) =>
    itemToString(a).localeCompare(itemToString(b))
  );

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    inputValue,
    setInputValue,
    selectItem,
  } = useCombobox({
    items: sortedItems,
    itemToString,
    selectedItem: sortedItems.find((i) => i.id === selectedItemId) || null,
    onSelectedItemChange: async ({ selectedItem }) => {
      if (!selectedItem) return;
      if (typeof selectedItem === "string" && createNewItem) {
        try {
          const newItem = await createNewItem(selectedItem);
          onSelect(newItem);
        } catch (err) {
          console.error("[ComboBox] Error creating new item:", err);
        }
      } else {
        onSelect(selectedItem);
      }
    },
    onInputValueChange: ({ inputValue }) => {
      setInputValue(inputValue || "");
    },
  });

  const filtered = sortedItems.filter((item) =>
    itemToString(item)
      .toLowerCase()
      .includes(inputValue?.toLowerCase() || "")
  );

  const canCreate =
    inputValue &&
    createNewItem &&
    !filtered.some(
      (item) => itemToString(item).toLowerCase() === inputValue.toLowerCase()
    );

  return (
    <Box position="relative" w="100%" fontFamily="Tahoma, Arial, sans-serif">
      {/* Input box with Windows XP-style inset */}
      <Input
        placeholder={placeholder}
        value={inputValue || ""}
        onChange={(e) => setInputValue(e.target.value)}
        {...getInputProps({})}
        borderRadius="sm"
        borderWidth="2px"
        borderColor="gray.300"
        boxShadow="inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.1)"
        bg="gray.100"
        _focus={{
          borderColor: "blue.400",
          boxShadow:
            "inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.1), 0 0 0 1px var(--chakra-colors-blue-400)",
        }}
        _hover={{
          borderColor: "blue.200",
        }}
        py={2}
      />

      {/* Dropdown menu */}
      <Box
        {...getMenuProps()}
        position="absolute"
        mt={1}
        w="100%"
        bg="white"
        border="1px solid"
        borderColor="gray.400"
        borderRadius="sm"
        boxShadow="2px 2px 5px rgba(0,0,0,0.25)"
        zIndex={10}
        maxH="200px"
        overflowY="auto"
      >
        {isOpen && (
          <VStack align="start" spacing={0}>
            {filtered.map((item, index) => (
              <Box
                key={item.id}
                {...getItemProps({ item, index })}
                px={3}
                py={1.5}
                w="100%"
                bg={highlightedIndex === index ? "blue.200" : "transparent"}
                color={highlightedIndex === index ? "black" : "inherit"}
                _hover={{ bg: "blue.100" }}
                cursor="pointer"
              >
                <Text fontSize="sm">{itemToString(item)}</Text>
              </Box>
            ))}
            {canCreate && (
              <Box
                onClick={() => selectItem(inputValue)}
                px={3}
                py={1.5}
                w="100%"
                bg="gray.100"
                _hover={{ bg: "blue.100" }}
                cursor="pointer"
              >
                <Text fontSize="sm" color="gray.700">
                  + Create "{inputValue}"
                </Text>
              </Box>
            )}
          </VStack>
        )}
      </Box>
    </Box>
  );
}
