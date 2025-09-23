import { Box, Input } from "@chakra-ui/react";
import { useCombobox } from "downshift";

export default function ComboBox({
  items,
  selectedItemId,
  placeholder,
  onSelect,
  createNewItem,
}) {
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
    items,
    itemToString: (item) => (item ? item.name : ""),
    selectedItem: items.find((c) => c.id === selectedItemId) || null,
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

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(inputValue?.toLowerCase() || "")
  );

  const canCreate =
    inputValue &&
    !filtered.some(
      (item) => item.name.toLowerCase() === inputValue.toLowerCase()
    );

  return (
    <Box position="relative">
      <Input
        size="sm"
        placeholder={placeholder}
        value={inputValue || ""}
        onChange={(e) => setInputValue(e.target.value)}
        {...getInputProps({})} // still pass down other props from Downshift
      />
      <Box
        {...getMenuProps()}
        borderWidth={isOpen ? "1px" : 0}
        borderRadius="md"
        mt={1}
        bg="white"
        zIndex={10}
        position="absolute"
        w="full"
        maxH="200px"
        overflowY="auto"
      >
        {isOpen &&
          filtered.map((item, index) => (
            <Box
              key={item.id}
              px={3}
              py={2}
              bg={highlightedIndex === index ? "gray.100" : "white"}
              cursor="pointer"
              {...getItemProps({ item, index })}
            >
              {item.name}
            </Box>
          ))}

        {isOpen && canCreate && (
          <Box
            px={3}
            py={2}
            bg={highlightedIndex === filtered.length ? "gray.100" : "white"}
            cursor="pointer"
            fontStyle="italic"
            color="blue.500"
            onClick={() => {
              if (!createNewItem) return;
              selectItem(inputValue);
            }}
          >
            + Create "{inputValue}"
          </Box>
        )}
      </Box>
    </Box>
  );
}
