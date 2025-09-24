// frontend/src/theme/components/button.js

const Button = {
  baseStyle: {
    appearance: "none",
    borderRadius: "6px",
    fontWeight: "500",
    lineHeight: "20px",
    cursor: "pointer",
    transition: "background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1)",
    _focus: {
      outline: "1px transparent",
      boxShadow: "none",
    },
    _disabled: {
      cursor: "default",
      opacity: 0.6,
    },
  },
  variants: {
    primary: {
      bg: "#1E88E5",
      color: "white",
      _hover: { bg: "#1565C0" },
      _active: { bg: "#0D47A1" },
    },
    secondary: {
      bg: "#F3F4F6",
      color: "#24292E",
      border: "1px solid #D1D5DB",
      _hover: { bg: "#E5E7EB" },
      _active: { bg: "#D1D5DB" },
    },
    danger: {
      bg: "red",
      color: "white",
      _hover: { bg: "#C53030" },
      _active: { bg: "#9B2C2C" },
    },
    outline: {
      bg: "transparent",
      color: "#1E88E5",
      border: "1px solid #1E88E5",
      _hover: { bg: "#E3F2FD" },
      _active: { bg: "#BBDEFB" },
    },
    ghost: {
      bg: "transparent",
      color: "#1E88E5",
      _hover: { bg: "#E3F2FD" },
      _active: { bg: "#BBDEFB" },
    },
  },
  sizes: {
    sm: {
      fontSize: ["10px", "12px"], // mobile -> larger screens
      px: ["8px", "12px"],
      py: ["2px", "4px"],
    },
    md: {
      fontSize: ["12px", "14px"],
      px: ["12px", "16px"],
      py: ["4px", "6px"],
    },
    lg: {
      fontSize: ["14px", "16px"],
      px: ["16px", "20px"],
      py: ["6px", "8px"],
    },
  },
  defaultProps: {
    size: "md",
    variant: "primary",
  },
};

export default Button;
