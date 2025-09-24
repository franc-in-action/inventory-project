const Tabs = {
  baseStyle: {
    tab: {
      _focus: { boxShadow: "none" },
      textAlign: "center",
      fontSize: "16px",
      height: "36px",
      lineHeight: "36px",
      color: "#555",
      bg: "#f4f4f4",
      position: "relative",
      cursor: "pointer",
      transition: "0.25s background ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      _hover: {
        _after: { opacity: 1 },
      },
      _selected: {
        bg: "#eee",
      },
      _after: {
        content: '""',
        height: "2px",
        width: "100%",
        position: "absolute",
        bottom: 0,
        left: 0,
        bg: "#ccc",
        opacity: 0,
        transition: "0.25s ease",
      },
    },
    tablist: {
      overflowX: "auto",
      whiteSpace: "nowrap",
      position: "relative",
      borderBottom: "2px solid #eee",
      "&::-webkit-scrollbar": { display: "none" },
    },
    tabpanel: {
      p: 4,
      bg: "#eee",
      color: "#333",
      fontSize: "16px",
      position: "relative",
      minHeight: "100px",
    },
  },
  sizes: {},
  variants: {
    admin: {
      tablist: {
        overflowX: "auto",
        whiteSpace: "nowrap",
        position: "relative",
        "&::-webkit-scrollbar": { display: "none" },
      },
      tab: {
        bg: "#f4f4f4",
        _selected: { bg: "#eee", _after: { opacity: 1, bg: "#1E88E5" } },
        _hover: { _after: { opacity: 1, bg: "#ccc" } },
      },
      tabpanel: {
        bg: "#eee",
        color: "#333",
        p: 4,
      },
    },
  },
  defaultProps: {
    variant: "admin",
  },
};

export default Tabs;
