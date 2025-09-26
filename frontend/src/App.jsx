import { useState, useCallback } from "react";
import { ChakraProvider, Box, useDisclosure } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./modules/auth/Login.jsx";
import { LocationsProvider } from "./modules/locations/contexts/LocationsContext.jsx";
import { ProductsProvider } from "./modules/products/contexts/ProductsContext.jsx";
import { CustomersProvider } from "./modules/customers/contexts/CustomersContext.jsx";
import { VendorsProvider } from "./modules/vendors/contexts/VendorsContext.jsx";
import { IssuedPaymentsProvider } from "./modules/issuedpayments/contexts/IssuedPaymentsContext.jsx";
import { PurchasesProvider } from "./modules/purchases/contexts/PurchasesContext.jsx";
import { PaymentsProvider } from "./modules/payments/contexts/PaymentsContext.jsx";
import { SalesProvider } from "./modules/sales/contexts/SalesContext.jsx";
import { CategoriesProvider } from "./modules/categories/contexts/CategoriesContext.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import ProductsPage from "./modules/products/ProductsPage.jsx";
import CustomersPage from "./modules/customers/CustomersPage.jsx";
import VendorsPage from "./modules/vendors/VendorsPage.jsx";
import SalesPage from "./modules/sales/SalesPage.jsx";
import PaymentsPage from "./modules/payments/PaymentsPage.jsx";
import PurchasesPage from "./modules/purchases/PurchasePage.jsx";
import LocationsPage from "./modules/locations/LocationsPage.jsx";
import StockPage from "./modules/stock/StockPage.jsx";
import StockAdjustmentsPage from "./modules/stock/StockAdjustmentsPage.jsx";
import AdminToolsPage from "./modules/admin/AdminToolsPage.jsx";

import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";

import { PERMISSIONS } from "./constants/permissions.js";
import {
  isLoggedIn,
  userHasRole,
  getDefaultPage,
} from "./modules/auth/authApi.js";

import { ThemeProvider, useThemeSwitcher } from "./theme/ThemeContext.jsx";

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
    <Box minH="100vh" display="flex">
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
        <Header onOpenSidebar={onOpen} onRefresh={handleRefresh} />
        <Box key={refreshKey} flex="1">
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemeConsumerApp />
    </ThemeProvider>
  );
}

/**
 * Separate component to consume the dynamic theme from ThemeContext
 */
function ThemeConsumerApp() {
  const { theme } = useThemeSwitcher();

  return (
    <ChakraProvider theme={theme}>
      <LocationsProvider>
        <Router>
          <Routes>
            {/* ---------- Public ---------- */}
            <Route path="/login" element={<Login />} />

            {/* ---------- Protected ---------- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.DASHBOARD}>
                    <ProtectedLayout>
                      <VendorsProvider>
                        <CategoriesProvider>
                          <ProductsProvider>
                            <CustomersProvider>
                              <SalesProvider>
                                <PaymentsProvider>
                                  <PurchasesProvider>
                                    <Dashboard />
                                  </PurchasesProvider>
                                </PaymentsProvider>
                              </SalesProvider>
                            </CustomersProvider>
                          </ProductsProvider>
                        </CategoriesProvider>
                      </VendorsProvider>
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ---------- Products ---------- */}
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.PRODUCTS}>
                    <ProtectedLayout>
                      <VendorsProvider>
                        <CategoriesProvider>
                          <ProductsProvider>
                            <SalesProvider>
                              <PurchasesProvider>
                                <ProductsPage />
                              </PurchasesProvider>
                            </SalesProvider>
                          </ProductsProvider>
                        </CategoriesProvider>
                      </VendorsProvider>
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ---------- Stock ---------- */}
            <Route
              path="/stock"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.STOCK}>
                    <ProtectedLayout>
                      <CategoriesProvider>
                        <ProductsProvider>
                          <PurchasesProvider>
                            <StockPage />
                          </PurchasesProvider>
                        </ProductsProvider>
                      </CategoriesProvider>
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
                      <CategoriesProvider>
                        <ProductsProvider>
                          <StockAdjustmentsPage />
                        </ProductsProvider>
                      </CategoriesProvider>
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ---------- Customers ---------- */}
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.CUSTOMERS}>
                    <ProtectedLayout>
                      <CustomersProvider>
                        <PaymentsProvider>
                          <CategoriesProvider>
                            <ProductsProvider>
                              <SalesProvider>
                                <CustomersPage />
                              </SalesProvider>
                            </ProductsProvider>
                          </CategoriesProvider>
                        </PaymentsProvider>
                      </CustomersProvider>
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ---------- Vendors ---------- */}
            <Route
              path="/vendors"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.VENDORS}>
                    <ProtectedLayout>
                      <VendorsProvider>
                        <PurchasesProvider>
                          <IssuedPaymentsProvider>
                            <VendorsPage />
                          </IssuedPaymentsProvider>
                        </PurchasesProvider>
                      </VendorsProvider>
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ---------- Sales ---------- */}
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.SALES}>
                    <ProtectedLayout>
                      <CategoriesProvider>
                        <ProductsProvider>
                          <CustomersProvider>
                            <SalesProvider>
                              <SalesPage />
                            </SalesProvider>
                          </CustomersProvider>
                        </ProductsProvider>
                      </CategoriesProvider>
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ---------- Payments ---------- */}
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.PAYMENTS}>
                    <ProtectedLayout>
                      <ProductsProvider>
                        <CustomersProvider>
                          <PaymentsProvider>
                            <SalesProvider>
                              <PaymentsPage />
                            </SalesProvider>
                          </PaymentsProvider>
                        </CustomersProvider>
                      </ProductsProvider>
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ---------- Purchases ---------- */}
            <Route
              path="/purchases"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.PURCHASES}>
                    <ProtectedLayout>
                      <VendorsProvider>
                        <CategoriesProvider>
                          <ProductsProvider>
                            <PurchasesProvider>
                              <PurchasesPage />
                            </PurchasesProvider>
                          </ProductsProvider>
                        </CategoriesProvider>
                      </VendorsProvider>
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ---------- Locations ---------- */}
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

            {/* ---------- Admin Tools ---------- */}
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

            {/* ---------- Catch-all ---------- */}
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
      </LocationsProvider>
    </ChakraProvider>
  );
}
