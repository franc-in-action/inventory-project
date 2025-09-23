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
import { PERMISSIONS } from "./utils/permissions.js";
import { isLoggedIn, userHasRole, getDefaultPage } from "./utils/authUtils.js";

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, allowedRoles }) {
  return userHasRole(allowedRoles) ? (
    children
  ) : (
    <Navigate to={getDefaultPage()} replace />
  );
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
        display="flex"
        flexDirection="column"
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
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected + Role-based */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={PERMISSIONS.DASHBOARD}>
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={PERMISSIONS.PRODUCTS}>
                  <ProtectedLayout>
                    <Products />
                  </ProtectedLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route
            path="*"
            element={
              isLoggedIn() ? (
                <Navigate to={getDefaultPage()} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
