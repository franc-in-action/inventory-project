import {
  Input,
  Text,
  useTheme,
  useColorModeValue,
  chakra,
} from "@chakra-ui/react";
import { useCombobox } from "downshift";

// Theme-aware wrappers
const ComboBoxWrapper = chakra("div");
const ComboBoxMenu = chakra("div");
const ComboBoxItem = chakra("div");

export default function ComboBox({
  items = [],
  selectedItemId,
  placeholder = "",
  onSelect,
  createNewItem,
  itemToString = (item) => (item ? item.name : ""),
}) {
  const theme = useTheme();

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
    onInputValueChange: ({ inputValue }) => setInputValue(inputValue || ""),
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

  const menuBg = useColorModeValue(
    theme.components.ComboBox.baseStyle.menu.bg,
    theme.components.ComboBox.baseStyle.menu._dark?.bg
  );

  const menuBorder = useColorModeValue(
    theme.components.ComboBox.baseStyle.menu.borderColor,
    theme.components.ComboBox.baseStyle.menu._dark?.borderColor
  );

  return (
    <ComboBoxWrapper __css={theme.components.ComboBox.baseStyle.wrapper}>
      <Input
        placeholder={placeholder}
        value={inputValue || ""}
        onChange={(e) => setInputValue(e.target.value)}
        {...getInputProps({})}
        __css={theme.components.ComboBox.baseStyle.input}
      />

      <ComboBoxMenu
        {...getMenuProps()}
        bg={menuBg}
        borderColor={menuBorder}
        __css={theme.components.ComboBox.baseStyle.menu}
      >
        {isOpen &&
          filtered.map((item, index) => (
            <ComboBoxItem
              key={item.id}
              {...getItemProps({ item, index })}
              __css={{
                ...theme.components.ComboBox.baseStyle.item,
                ...(highlightedIndex === index
                  ? theme.components.ComboBox.baseStyle.item._selected
                  : {}),
              }}
            >
              <Text fontSize="sm">{itemToString(item)}</Text>
            </ComboBoxItem>
          ))}
        {isOpen && canCreate && (
          <ComboBoxItem
            onClick={() => selectItem(inputValue)}
            __css={theme.components.ComboBox.baseStyle.item}
          >
            <Text fontSize="sm">+ Create "{inputValue}"</Text>
          </ComboBoxItem>
        )}
      </ComboBoxMenu>
    </ComboBoxWrapper>
  );
}
