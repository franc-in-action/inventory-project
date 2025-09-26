import { Box, Input } from "@chakra-ui/react";
import { useCombobox } from "downshift";
import { useCategories } from "../modules/categories/contexts/CategoriesContext.jsx";

export default function ComboBox({ selectedItemId, placeholder, onSelect }) {
  const { categories, addCategory } = useCategories();
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
    items: categories,
    itemToString: (item) => (item ? item.name : ""),
    selectedItem: categories.find((c) => c.id === selectedItemId) || null,
    onSelectedItemChange: async ({ selectedItem }) => {
      if (!selectedItem) return;

      // If user typed a string that's not an existing category
      if (typeof selectedItem === "string") {
        try {
          const newItem = await addCategory(selectedItem);
          onSelect(newItem); // notify parent
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

  const filtered = categories.filter((item) =>
    item.name.toLowerCase().includes(inputValue?.toLowerCase() || "")
  );

  const canCreate =
    inputValue &&
    !filtered.some(
      (item) => item.name.toLowerCase() === inputValue.toLowerCase()
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
              {item.name}
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
