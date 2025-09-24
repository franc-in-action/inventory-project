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
        // hide scrollbar globally if you want
        "&::-webkit-scrollbar": { display: "none" },
      },
    },
  },
};
export default Tabs;
