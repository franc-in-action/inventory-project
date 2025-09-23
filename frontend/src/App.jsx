import { ChakraProvider, Box, useDisclosure } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function ProtectedLayout({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/products", label: "Products" },
  ];

  return (
    <Box minH="100vh" display="flex" bg="gray.50">
      <Sidebar
        links={links}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
      />
      <Box
        flex="1"
        ml={{ base: 0, md: 60 }}
        p={{ base: 2, md: 4 }}
        display={"flex"}
        flexDirection={"column"}
        minH="100vh"
        gap={2}
        transition="margin-left 0.2s ease"
      >
        <Header onOpenSidebar={onOpen} />
        {children}
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Products />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
