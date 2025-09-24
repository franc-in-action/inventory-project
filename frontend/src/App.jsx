import { useState, useCallback } from "react";
import { ChakraProvider, Box, useDisclosure } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./modules/auth/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProductsPage from "./modules/products/ProductsPage.jsx";
import SalesPage from "./modules/sales/SalesPage.jsx";
import PurchasesPage from "./modules/purchases/PurchasePage.jsx";
import LocationsPage from "./modules/locations/LocationsPage.jsx";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { PERMISSIONS } from "./constants/permissions.js";
import {
  isLoggedIn,
  userHasRole,
  getDefaultPage,
} from "./modules/auth/authApi.js";

// Admin Tools Pages
import AdminToolsPage from "./modules/admin/AdminToolsPage.jsx";
import { ProductsProvider } from "./modules/products/contexts/ProductsContext.jsx";

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

export function ProtectedLayout({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1); // Increment key to force re-render children
  }, []);

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/products", label: "Products" },
    { to: "/sales", label: "Sales" },
    { to: "/purchases", label: "Purchases" },
    { to: "/locations", label: "Locations" },
    { to: "/admin-tools", label: "Admin Tools" },
    { to: "/admin/logs", label: "Logs" },
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
        <Header onOpenSidebar={onOpen} onRefresh={handleRefresh} />
        {/* Key triggers children re-render */}
        <Box key={refreshKey} flex="1">
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ChakraProvider>
      <ProductsProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
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
                      <ProductsPage />
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.SALES}>
                    <ProtectedLayout>
                      <SalesPage />
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.PURCHASES}>
                    <ProtectedLayout>
                      <PurchasesPage />
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/locations"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.LOCATIONS}>
                    <ProtectedLayout>
                      <LocationsPage />
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin Tools */}
            <Route
              path="/admin-tools"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.ADMIN_TOOLS}>
                    <ProtectedLayout>
                      <AdminToolsPage />
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
      </ProductsProvider>
    </ChakraProvider>
  );
}
