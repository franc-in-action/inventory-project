import { Box, Input } from "@chakra-ui/react";
import { useCombobox } from "downshift";

export default function ComboBox({
  items = [],
  selectedItemId,
  placeholder = "",
  onSelect,
  createNewItem, // optional async function to create new item
  itemToString = (item) => (item ? item.name : ""), // default display
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
    itemToString,
    selectedItem: items.find((i) => i.id === selectedItemId) || null,
    onSelectedItemChange: async ({ selectedItem }) => {
      if (!selectedItem) return;
      // If user typed a string that's not in the list
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
    <Box>
      <Input
        placeholder={placeholder}
        value={inputValue || ""}
        onChange={(e) => setInputValue(e.target.value)}
        {...getInputProps({})}
      />
      <Box {...getMenuProps()}>
        {isOpen &&
          filtered.map((item, index) => (
            <Box
              key={item.id}
              {...getItemProps({ item, index })}
              bg={highlightedIndex === index ? "gray.100" : "transparent"}
              cursor="pointer"
              px={2}
              py={1}
            >
              {itemToString(item)}
            </Box>
          ))}

        {isOpen && canCreate && (
          <Box
            onClick={() => selectItem(inputValue)}
            bg="gray.50"
            cursor="pointer"
            px={2}
            py={1}
          >
            + Create "{inputValue}"
          </Box>
        )}
      </Box>
    </Box>
  );
}
