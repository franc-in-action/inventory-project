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
import { PurchasesProvider } from "./modules/purchases/contexts/PurchasesContext.jsx"; // ✅ new
import { PaymentsProvider } from "./modules/payments/contexts/PaymentsContext.jsx"; // ✅ new
import { SalesProvider } from "./modules/sales/contexts/SalesContext.jsx";
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
    <Box minH="100vh" display="flex" bg="gray.50">
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
    <ChakraProvider>
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
                      </VendorsProvider>
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ✅ Products + stock related pages need ProductsProvider */}
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.PRODUCTS}>
                    <ProtectedLayout>
                      <VendorsProvider>
                        <ProductsProvider>
                          <SalesProvider>
                            <PurchasesProvider>
                              <ProductsPage />
                            </PurchasesProvider>
                          </SalesProvider>
                        </ProductsProvider>
                      </VendorsProvider>
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
                      <ProductsProvider>
                        <PurchasesProvider>
                          <StockPage />
                        </PurchasesProvider>
                      </ProductsProvider>
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
                      <ProductsProvider>
                        <StockAdjustmentsPage />
                      </ProductsProvider>
                    </ProtectedLayout>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ✅ Customers page now wrapped with CustomersProvider */}
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={PERMISSIONS.CUSTOMERS}>
                    <ProtectedLayout>
                      <CustomersProvider>
                        <PaymentsProvider>
                          <ProductsProvider>
                            <SalesProvider>
                              <CustomersPage />
                            </SalesProvider>
                          </ProductsProvider>
                        </PaymentsProvider>
                      </CustomersProvider>
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
                      <VendorsProvider>
                        <PurchasesProvider>
                          <VendorsPage />
                        </PurchasesProvider>
                      </VendorsProvider>
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
                      <ProductsProvider>
                        <CustomersProvider>
                          <SalesProvider>
                            <SalesPage />
                          </SalesProvider>
                        </CustomersProvider>
                      </ProductsProvider>
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
                      <CustomersProvider>
                        <PaymentsProvider>
                          <SalesProvider>
                            <PaymentsPage />
                          </SalesProvider>
                        </PaymentsProvider>
                      </CustomersProvider>
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
                      <VendorsProvider>
                        <ProductsProvider>
                          <PurchasesProvider>
                            <PurchasesPage />
                          </PurchasesProvider>
                        </ProductsProvider>
                      </VendorsProvider>
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

            {/* ✅ Admin tools: no ProductsProvider here */}
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
