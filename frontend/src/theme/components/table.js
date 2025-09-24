const Table = {
  baseStyle: {
    table: {
      borderCollapse: "collapse", // Like Excel
      width: "100%",
    },
    th: {
      bg: "gray.100", // light gray header
      fontWeight: "bold",
      fontSize: "sm",
      px: 2,
      py: 1,
      border: "1px solid",
      borderColor: "gray.200",
      textAlign: "left",
    },
    td: {
      fontSize: "sm",
      px: 2,
      py: 1,
      border: "1px solid",
      borderColor: "gray.200",
    },
    tr: {
      _hover: {
        bg: "gray.50", // hover effect like Excel selection
      },
    },
  },
  sizes: {},
  variants: {
    simple: {
      th: {
        bg: "gray.100",
      },
      td: {},
    },
  },
  defaultProps: {
    size: "sm",
    variant: "simple",
  },
};

export default Table;
