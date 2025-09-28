import React, { useState, createContext, useContext } from "react";
import { Rnd } from "react-rnd";
import {
  Box,
  Button,
  Input,
  Text,
  chakra,
  useColorModeValue,
  useStyleConfig,
} from "@chakra-ui/react";
import { useCombobox } from "downshift";

// Chakra-wrapped ComboBox elements
const ComboBoxWrapper = chakra("div");
const ComboBoxMenu = chakra("div");
const ComboBoxItem = chakra("div");

/** ComboBox Component */
export const ComboBox = ({
  items = [],
  selectedItemId,
  placeholder = "",
  onSelect,
  createNewItem,
  itemToString = (item) => (item ? item.name : ""),
}) => {
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
        const newItem = await createNewItem(selectedItem);
        onSelect(newItem);
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

  const menuBg = useColorModeValue("white", "gray.700");
  const menuBorder = useColorModeValue("gray.200", "gray.600");

  return (
    <ComboBoxWrapper>
      <Input
        placeholder={placeholder}
        value={inputValue || ""}
        onChange={(e) => setInputValue(e.target.value)}
        {...getInputProps()}
      />
      <ComboBoxMenu bg={menuBg} borderColor={menuBorder} {...getMenuProps()}>
        {isOpen &&
          filtered.map((item, index) => (
            <ComboBoxItem
              key={item.id}
              {...getItemProps({ item, index })}
              bg={highlightedIndex === index ? "blue.100" : "transparent"}
              px={2}
              py={1}
            >
              <Text fontSize="sm">{itemToString(item)}</Text>
            </ComboBoxItem>
          ))}
        {isOpen && canCreate && (
          <ComboBoxItem onClick={() => selectItem(inputValue)} px={2} py={1}>
            <Text fontSize="sm">+ Create "{inputValue}"</Text>
          </ComboBoxItem>
        )}
      </ComboBoxMenu>
    </ComboBoxWrapper>
  );
};

/** Custom Close Button */
export const CloseBtn = ({ onClick, ...props }) => {
  const styles = useStyleConfig("CloseBtn");
  return <Button onClick={onClick} __css={styles} {...props} />;
};

/** Window Context */
const WindowContext = createContext();

/** Window Component */
export const Window = ({
  children,
  onClose,
  allowMinimize = true,
  allowMaximize = true,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 400, height: 300 },
  minWidth = 300,
  minHeight = 200,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMinimize = () => allowMinimize && setIsMinimized(!isMinimized);
  const toggleMaximize = () => allowMaximize && setIsMaximized(!isMaximized);

  const containerStyle = {
    fontSize: "11px",
    borderRadius: "8px",
    boxShadow:
      "inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px grey, inset 2px 2px #fff",
    background: "#ece9d8",
    padding: "3px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  };

  return (
    <WindowContext.Provider
      value={{
        isMinimized,
        isMaximized,
        toggleMinimize,
        toggleMaximize,
        onClose,
        allowMinimize,
        allowMaximize,
      }}
    >
      <Rnd
        default={{ ...defaultPosition, ...defaultSize }}
        size={isMaximized ? { width: "100vw", height: "100vh" } : undefined}
        minWidth={minWidth}
        minHeight={minHeight}
        bounds="window"
        enableResizing={!isMaximized}
        dragHandleClassName="title-bar"
      >
        <Box __css={containerStyle}>{children}</Box>
      </Rnd>
    </WindowContext.Provider>
  );
};

/** TitleBar Component */
export const TitleBar = ({ children }) => {
  const {
    toggleMinimize,
    toggleMaximize,
    onClose,
    allowMinimize,
    allowMaximize,
  } = useContext(WindowContext);

  const titleBarStyle = {
    fontFamily: "Trebuchet MS, sans-serif",
    fontWeight: 700,
    fontSize: "11px",
    color: "#fff",
    letterSpacing: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "21px",
    padding: "3px 2px 3px 3px",
    background:
      "linear-gradient(180deg,#0997ff,#0053ee 8%,#0050ee 40%,#06f 88%,#06f 93%,#005bff 95%,#003dd7 96%,#003dd7)",
    borderTop: "1px solid #0831d9",
    borderLeft: "1px solid #0831d9",
    borderRight: "1px solid #001ea0",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "7px",
    textShadow: "1px 1px #0f1089",
  };

  const buttonStyle = {
    minWidth: "16px",
    minHeight: "14px",
    marginLeft: "2px",
    padding: "0",
    display: "block",
    backgroundColor: "#0050ee",
    border: "none",
    boxShadow: "none",
    cursor: "pointer",
    fontSize: "11px",
  };

  return (
    <Box
      className="title-bar"
      __css={titleBarStyle}
      onDoubleClick={toggleMaximize}
    >
      <Box>{children}</Box>
      <Box display="flex">
        {allowMinimize && (
          <Box as="button" __css={buttonStyle} onClick={toggleMinimize}>
            ─
          </Box>
        )}
        {allowMaximize && (
          <Box as="button" __css={buttonStyle} onClick={toggleMaximize}>
            ☐
          </Box>
        )}
        <Box as="button" __css={buttonStyle} onClick={onClose}>
          ✕
        </Box>
      </Box>
    </Box>
  );
};

/** WindowBody Component */
export const WindowBody = ({ children }) => {
  const { isMinimized } = useContext(WindowContext);

  if (isMinimized) return null;

  const bodyStyle = {
    margin: "8px",
    padding: "10px",
    boxShadow:
      "inset 1px 1px #fcfcfe, inset -1px -1px #fcfcfe, 1px 2px 2px 0 rgba(208,206,191,.75)",
    background: "linear-gradient(180deg,#fcfcfe,#f4f3ee)",
    border: "1px solid #919b9c",
    borderRadius: "4px",
    flex: 1,
    overflow: "auto",
  };

  return <Box __css={bodyStyle}>{children}</Box>;
};

/** XP-style Tabs */
export const XpTab = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabListStyle = {
    display: "flex",
    margin: "0 0 -2px",
    paddingLeft: "3px",
    listStyle: "none",
    position: "relative",
  };

  const tabStyle = {
    padding: "3px 6px",
    marginRight: "2px",
    border: "1px solid #003c74",
    borderBottom: "none",
    background: "linear-gradient(180deg,#fff,#ecebe5 86%,#d8d0c4)",
    fontSize: "11px",
    cursor: "pointer",
    borderRadius: "3px",
  };

  const activeTabStyle = {
    ...tabStyle,
    background: "#fff",
    borderBottom: "1px solid #fff",
  };

  const tabPanelStyle = {
    padding: "14px",
    background: "linear-gradient(180deg,#fcfcfe,#f4f3ee)",
    border: "1px solid #919b9c",
    boxShadow:
      "inset 1px 1px #fcfcfe,inset -1px -1px #fcfcfe,1px 2px 2px 0 rgba(208,206,191,.75)",
    marginBottom: "9px",
    borderRadius: "3px",
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box as="menu" role="tablist" __css={tabListStyle}>
        {tabs.map((tab, idx) => (
          <Box
            key={tab.label}
            as="button"
            role="tab"
            __css={activeIndex === idx ? activeTabStyle : tabStyle}
            onClick={() => setActiveIndex(idx)}
          >
            {tab.label}
          </Box>
        ))}
      </Box>
      <Box role="tabpanel" __css={tabPanelStyle}>
        {tabs[activeIndex].content}
      </Box>
    </Box>
  );
};
