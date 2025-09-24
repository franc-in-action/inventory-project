const Input = {
  baseStyle: {
    field: {
      border: "1px solid rgba(27,31,35,0.15)",
      borderRadius: "6px",
      boxShadow: "rgba(27,31,35,0.04) 0 1px 0",
      fontSize: "14px",
      px: "12px",
      py: "6px",
      _focus: {
        borderColor: "#0366d6",
        boxShadow: "0 0 0 1px #0366d6",
      },
      _hover: {
        borderColor: "rgba(27,31,35,0.3)",
      },
      _disabled: {
        bg: "#FAFBFC",
        cursor: "not-allowed",
        opacity: 0.6,
      },
    },
  },
};

export default Input;
