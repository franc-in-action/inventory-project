import { useState, useCallback } from "react";
import { ChakraProvider, Box, useDisclosure } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./modules/auth/Login.jsx";
import { UserPreferenceProvider } from "./modules/userpreferences/contexts/UserPreferenceContext.jsx";
import { LocationsProvider } from "./modules/locations/contexts/LocationsContext.jsx";
import { StockProvider } from "./modules/stock/contexts/StockContext.jsx";
import { ProductsProvider } from "./modules/products/contexts/ProductsContext.jsx";
import { CustomersProvider } from "./modules/customers/contexts/CustomersContext.jsx";
import { VendorsProvider } from "./modules/vendors/contexts/VendorsContext.jsx";
import { IssuedPaymentsProvider } from "./modules/issuedpayments/contexts/IssuedPaymentsContext.jsx";
import { PurchasesProvider } from "./modules/purchases/contexts/PurchasesContext.jsx";
import { PaymentsProvider } from "./modules/payments/contexts/PaymentsContext.jsx";
import { SalesProvider } from "./modules/sales/contexts/SalesContext.jsx";
import { CategoriesProvider } from "./modules/categories/contexts/CategoriesContext.jsx";
import { ReportsProvider } from "./modules/reports/contexts/ReportsContext.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import POSDashboard from "./pages/POSDashboard.jsx";
import ProductsPage from "./modules/products/ProductsPage.jsx";
import CustomersPage from "./modules/customers/CustomersPage.jsx";
import VendorsPage from "./modules/vendors/VendorsPage.jsx";
import SalesPage from "./modules/sales/SalesPage.jsx";
import ReturnsPage from "./modules/returns/ReturnsPage.jsx";
import PaymentsPage from "./modules/payments/PaymentsPage.jsx";
import AdjustmentsPage from "./modules/adjustments/AdjustmentsPage.jsx";
import PurchasesPage from "./modules/purchases/PurchasePage.jsx";
import LocationsPage from "./modules/locations/LocationsPage.jsx";
import StockPage from "./modules/stock/StockPage.jsx";
import StockAdjustmentsPage from "./modules/stock/StockAdjustmentsPage.jsx";
import AdminToolsPage from "./modules/admin/AdminToolsPage.jsx";

// Reports
import StockReportsPage from "./modules/reports/models/StockReportsPage.jsx";
import SalesReportsPage from "./modules/reports/models/SalesReportsPage.jsx";
import CustomerReportsPage from "./modules/reports/models/CustomerReportsPage.jsx";
import ReportsPage from "./modules/reports/ReportsPage.jsx";

import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";

import { PERMISSIONS } from "./constants/permissions.js";
import {
  isLoggedIn,
  userHasRole,
  getDefaultPage,
} from "./modules/auth/authApi.js";

import { ThemeProvider, useThemeSwitcher } from "./theme/ThemeContext.jsx";

/* ----------------- Helpers ----------------- */
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

  const handleRefresh = useCallback(
    () => setRefreshKey((prev) => prev + 1),
    []
  );

  return (
    <Box h="100vh" display="flex">
      <Sidebar isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
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
        <Header onOpenSidebar={onOpen} onRefresh={handleRefresh} maxH={"20vh"} />
        <Box key={refreshKey} flex="1" maxH={"80vh"} overflowX={"auto"}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

/* ----------------- App Root ----------------- */
export default function App() {
  return (
    <UserPreferenceProvider>
      <ThemeProvider>
        <ThemeConsumerApp />
      </ThemeProvider>
    </UserPreferenceProvider>
  );
}

/* Consume dynamic theme */
function ThemeConsumerApp() {
  const { theme } = useThemeSwitcher();

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <AppProviders>
                <ProtectedRoutes />
              </AppProviders>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

/* ----------------- Providers Wrapper (All Providers) ----------------- */
function AppProviders({ children }) {
  return (
    <LocationsProvider>
      <StockProvider>
        <SalesProvider>
          <PurchasesProvider>
            <ProductsProvider>
              <CustomersProvider>
                <VendorsProvider>
                  <IssuedPaymentsProvider>
                    <PaymentsProvider>
                      <CategoriesProvider>
                        <ReportsProvider>{children}</ReportsProvider>
                      </CategoriesProvider>
                    </PaymentsProvider>
                  </IssuedPaymentsProvider>
                </VendorsProvider>
              </CustomersProvider>
            </ProductsProvider>
          </PurchasesProvider>
        </SalesProvider>
      </StockProvider>
    </LocationsProvider>
  );
}

/* ----------------- All Protected Routes ----------------- */
function ProtectedRoutes() {
  return (
    <Routes>
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
        path="/pos"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.PRODUCTS}>
              <ProtectedLayout>
                <POSDashboard />
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
        path="/stock"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.STOCK}>
              <ProtectedLayout>
                <StockPage />
              </ProtectedLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock-adjustments"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.STOCK}>
              <ProtectedLayout>
                <StockAdjustmentsPage />
              </ProtectedLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.CUSTOMERS}>
              <ProtectedLayout>
                <CustomersPage />
              </ProtectedLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendors"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.VENDORS}>
              <ProtectedLayout>
                <VendorsPage />
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
        path="/returns"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.SALES}>
              <ProtectedLayout>
                <ReturnsPage />
              </ProtectedLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.PAYMENTS}>
              <ProtectedLayout>
                <PaymentsPage />
              </ProtectedLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/adjustments"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.ADJUSTMENTS}>
              <ProtectedLayout>
                <AdjustmentsPage />
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
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.REPORTS}>
              <ProtectedLayout>
                <ReportsPage />
              </ProtectedLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/stock"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.REPORTS}>
              <ProtectedLayout>
                <StockReportsPage />
              </ProtectedLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/sales"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.REPORTS}>
              <ProtectedLayout>
                <SalesReportsPage />
              </ProtectedLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/customers"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={PERMISSIONS.REPORTS}>
              <ProtectedLayout>
                <CustomerReportsPage />
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
  );
}
