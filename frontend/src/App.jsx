import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Loader } from 'lucide-react';
import WarehouseManagement from './pages/admin/WarehouseManagement';
import MarketInfoManagement from './pages/admin/MarketInfoManagement';
import CoffeeSamplesManagement from './pages/admin/CoffeeSamplesManagement';

// Lazy load components for better performance
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const CalculatorPage = React.lazy(() => import('./pages/CalculatorPage'));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage'));
const MarketInfoPage = React.lazy(() => import('./pages/MarketInfoPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));
const Layout = React.lazy(() => import('./components/Layout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
// Enhanced Loading Component
const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center font-['Inter',_'Segoe_UI',_sans-serif]">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg"
      >
        <Coffee className="w-8 h-8 text-white" />
      </motion.div>

      <div className="flex items-center justify-center space-x-2 mb-2">
        <Loader className="w-5 h-5 text-amber-600 animate-spin" />
        <h2 className="text-xl font-semibold text-amber-800">{message}</h2>
      </div>

      <p className="text-amber-600 text-sm">የቡና ንግድ ካልኩሌተር • Coffee Trading Calculator</p>

      {/* Loading bar */}
      <div className="w-64 h-1 bg-amber-100 rounded-full mt-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
          animate={{ x: [-256, 256] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  </div>
);

// Enhanced Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!user.isActive) {
    return <Navigate to="/subscribe" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Initializing application..." />;
  }

  if (user?.isActive) {
    return <Navigate to="/calculator" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Subscription Route Component
const SubscriptionRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading subscription..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.isActive) {
    return <Navigate to="/calculator" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Page Transition Wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

// Main App Content
function AppContent() {
  const { user } = useAuth();

  return (
    <div className="font-['Inter',_'Segoe_UI',_sans-serif] antialiased">
      <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              </PublicRoute>
            }
          />

          {/* Subscription Route */}
          <Route
            path="/subscribe"
            element={
              <SubscriptionRoute>
                <PageTransition>
                  <SubscriptionPage />
                </PageTransition>
              </SubscriptionRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/calculator"
            element={
              <PrivateRoute>
                <Layout>
                  <PageTransition>
                    <CalculatorPage />
                  </PageTransition>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/gallery"
            element={
              <PrivateRoute>
                <Layout>
                  <PageTransition>
                    <GalleryPage />
                  </PageTransition>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/market-info"
            element={
              <PrivateRoute>
                <Layout>
                  <PageTransition>
                    <MarketInfoPage />
                  </PageTransition>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Layout>
                  <PageTransition>
                    <ChatPage />
                  </PageTransition>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <PageTransition>
                    <ProfilePage />
                  </PageTransition>
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          {user?.role === 'admin' && (
            <>
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute>
                    <Layout>
                      <PageTransition>
                        <AdminDashboard />
                      </PageTransition>
                    </Layout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <PrivateRoute>
                    <Layout>
                      <PageTransition>
                        <UserManagement />
                      </PageTransition>
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/samples"
                element={
                  <PrivateRoute>
                    <Layout>
                      <PageTransition>
                        <CoffeeSamplesManagement />
                      </PageTransition>
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/market-info"
                element={
                  <PrivateRoute>
                    <Layout>
                      <PageTransition>
                        <MarketInfoManagement />
                      </PageTransition>
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/warehouses"
                element={
                  <PrivateRoute>
                    <Layout>
                      <PageTransition>
                        <WarehouseManagement />
                      </PageTransition>
                    </Layout>
                  </PrivateRoute>
                }
              />
            </>
          )}

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <Coffee className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                  <h1 className="text-4xl font-bold text-amber-800 mb-2">404</h1>
                  <p className="text-amber-600 mb-4">Page not found</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
                  >
                    Go Back
                  </motion.button>
                </motion.div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;