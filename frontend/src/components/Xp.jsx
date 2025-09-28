import React, { useState } from "react";
import { Rnd } from "react-rnd";
import {
  Box,
  Flex,
  IconButton,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Text,
  useTheme,
  useColorModeValue,
  chakra,
  Button,
  useStyleConfig,
} from "@chakra-ui/react";
import { CloseIcon, MinusIcon, AddIcon } from "@chakra-ui/icons";
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

  const menuBg = useColorModeValue(
    theme.components.ComboBox?.baseStyle?.menu?.bg ?? "white",
    theme.components.ComboBox?.baseStyle?.menu?._dark?.bg ?? "gray.700"
  );

  const menuBorder = useColorModeValue(
    theme.components.ComboBox?.baseStyle?.menu?.borderColor ?? "gray.200",
    theme.components.ComboBox?.baseStyle?.menu?._dark?.borderColor ?? "gray.600"
  );

  return (
    <ComboBoxWrapper __css={theme.components.ComboBox?.baseStyle?.wrapper}>
      <Input
        placeholder={placeholder}
        value={inputValue || ""}
        onChange={(e) => setInputValue(e.target.value)}
        {...getInputProps()}
        __css={theme.components.ComboBox?.baseStyle?.input}
      />
      <ComboBoxMenu
        {...getMenuProps()}
        bg={menuBg}
        borderColor={menuBorder}
        __css={theme.components.ComboBox?.baseStyle?.menu}
      >
        {isOpen &&
          filtered.map((item, index) => (
            <ComboBoxItem
              key={item.id}
              {...getItemProps({ item, index })}
              __css={{
                ...theme.components.ComboBox?.baseStyle?.item,
                ...(highlightedIndex === index
                  ? theme.components.ComboBox?.baseStyle?.item?._selected
                  : {}),
              }}
            >
              <Text fontSize="sm">{itemToString(item)}</Text>
            </ComboBoxItem>
          ))}
        {isOpen && canCreate && (
          <ComboBoxItem
            onClick={() => selectItem(inputValue)}
            __css={theme.components.ComboBox?.baseStyle?.item}
          >
            <Text fontSize="sm">+ Create "{inputValue}"</Text>
          </ComboBoxItem>
        )}
      </ComboBoxMenu>
    </ComboBoxWrapper>
  );
};

/** Custom CloseBtn */
export const CloseBtn = ({ onClick, ...props }) => {
  const styles = useStyleConfig("CloseBtn");
  return <Button onClick={onClick} __css={styles} {...props} />;
};

/** Custom Buttons */
const WindowButton = ({ type, onClick }) => {
  const labels = { minimize: "─", maximize: "☐", close: "✕" };
  return (
    <button
      className={`window-btn ${type}-btn`}
      aria-label={type}
      onClick={onClick}
      style={{
        width: "20px",
        height: "20px",
        marginLeft: "2px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      {labels[type]}
    </button>
  );
};

/** TitleBarText */
const TitleBarText = ({ children }) => (
  <div className="title-bar-text" style={{ fontWeight: "bold" }}>
    {children}
  </div>
);

/** TitleBarControls */
const TitleBarControls = ({ onMinimize, onMaximize, onClose }) => (
  <div className="title-bar-controls" style={{ display: "flex" }}>
    <WindowButton type="minimize" onClick={onMinimize} />
    <WindowButton type="maximize" onClick={onMaximize} />
    <WindowButton type="close" onClick={onClose} />
  </div>
);

/** TitleBar */
const TitleBar = ({
  title,
  onMinimize,
  onMaximize,
  onClose,
  onDoubleClick,
}) => (
  <div
    className="title-bar"
    onDoubleClick={onDoubleClick}
    style={{
      background: "#000080",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "2px 5px",
      cursor: "move",
      userSelect: "none",
    }}
  >
    <TitleBarText>{title}</TitleBarText>
    <TitleBarControls
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      onClose={onClose}
    />
  </div>
);

/** WindowBody */
const WindowBody = ({ children, isMinimized, isMaximized }) => {
  if (isMinimized) return null;
  return (
    <div
      className="window-body"
      style={{
        flex: 1,
        background: "#e0e0e0",
        overflow: "auto",
        padding: "5px",
      }}
    >
      {children}
    </div>
  );
};

/** Main Window Component */
export const Window = ({ title, children, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const toggleMaximize = () => setIsMaximized(!isMaximized);
  const handleTitleDoubleClick = () => toggleMaximize();

  return (
    <Rnd
      default={{ x: 100, y: 100, width: 400, height: 300 }}
      size={isMaximized ? { width: "100vw", height: "100vh" } : undefined}
      minWidth={300}
      minHeight={200}
      bounds="window"
      enableResizing={!isMaximized}
      dragHandleClassName="title-bar"
    >
      <div
        className="window"
        style={{
          display: "flex",
          flexDirection: "column",
          border: "2px solid black",
          boxShadow: "4px 4px 10px rgba(0,0,0,0.5)",
          background: "#c0c0c0",
          width: "100%",
          height: "100%",
        }}
      >
        <TitleBar
          title={title}
          onMinimize={toggleMinimize}
          onMaximize={toggleMaximize}
          onClose={onClose}
          onDoubleClick={handleTitleDoubleClick}
        />
        <WindowBody isMinimized={isMinimized} isMaximized={isMaximized}>
          {children}
        </WindowBody>
      </div>
    </Rnd>
  );
};

/** XP-style Tabs */
export const XpTab = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div
      className="xp-tabs"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        className="tab-list"
        style={{ display: "flex", borderBottom: "2px solid black" }}
      >
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActiveIndex(idx)}
            style={{
              padding: "4px 8px",
              cursor: "pointer",
              background: activeIndex === idx ? "#e0e0e0" : "#c0c0c0",
              borderTop: "2px solid black",
              borderLeft: "2px solid black",
              borderRight: "2px solid black",
              marginRight: "-2px",
            }}
            aria-selected={activeIndex === idx}
            aria-controls={`tabpanel-${idx}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="tab-panels"
        style={{ padding: "5px", background: "#e0e0e0", flex: 1 }}
      >
        {tabs.map((tab, idx) => (
          <div
            key={idx}
            id={`tabpanel-${idx}`}
            role="tabpanel"
            hidden={activeIndex !== idx}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};
