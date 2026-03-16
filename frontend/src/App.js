import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import HistoryPage from "./pages/HistoryPage";
import MeetingView from "./pages/MeetingView";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";

/** Fade wrapper for page transitions */
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Animated routes — wraps page content with AnimatePresence */
function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public routes ──────────────────────── */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <PageTransition><LoginPage /></PageTransition>}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <PageTransition><SignUpPage /></PageTransition>}
        />

        {/* ── Protected routes ──────────────────── */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition><Dashboard /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition><UploadPage /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition><HistoryPage /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meeting/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition><MeetingView /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition><SearchPage /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition><SettingsPage /></PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
