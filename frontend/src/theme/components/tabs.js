const Tabs = {
  baseStyle: {
    tab: {
      _focus: { boxShadow: "none" },
    },
  },
  variants: {
    admin: {
      tablist: {
        overflowX: "auto",
        whiteSpace: "nowrap",
        "&::-webkit-scrollbar": { display: "none" },
      },
    },
  },
};

export default Tabs;
