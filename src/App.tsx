import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SchoolProvider } from "@/contexts/SchoolContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { GlobalErrorBoundary } from "@/components/common/GlobalErrorBoundary";
import AppContent from "@/components/AppContent";
import ResetPasswordPage from "@/components/ResetPasswordPage";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import CertificateVerification from "@/pages/CertificateVerification";
import MaintenanceModeTest from "@/components/debug/MaintenanceModeTest";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UniversalLoginPage from "@/components/UniversalLoginPage";
import LandingPage from "@/components/LandingPage";
import "./App.css";
import "./utils/maintenanceDebugConsole";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes - increased for better performance
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
      retry: (failureCount, error: unknown) => {
        // Don't retry auth errors or validation errors
        if (
          error instanceof Error &&
          (error.message?.includes("auth") ||
            error.message?.includes("unauthorized") ||
            error.message?.includes("validation") ||
            error.message?.includes("permission"))
        ) {
          return false;
        }
        return failureCount < 1; // Reduced retries for better performance
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Reduced max delay
      refetchOnWindowFocus: false, // Disabled to reduce unnecessary requests
      refetchOnMount: false, // Disabled to reduce unnecessary requests
      refetchOnReconnect: false, // Disabled to reduce unnecessary requests
      refetchInterval: false, // Disabled by default, enable per query if needed
    },
    mutations: {
      retry: false, // Don't retry mutations to prevent data inconsistency
    },
  },
});

// Core App Router Component
const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* ====================================================== */}
      {/* PUBLIC ROUTES - Anyone can access these.              */}
      {/* They are NOT wrapped by ProtectedRoute.               */}
      {/* ====================================================== */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<UniversalLoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/verify-certificate/:certificateId"
        element={<CertificateVerification />}
      />
      <Route path="/debug/maintenance-test" element={<MaintenanceModeTest />} />

      {/* ====================================================== */}
      {/* PROTECTED ROUTES - Only logged-in users can access.   */}
      {/* These are all nested inside the ProtectedRoute element. */}
      {/* ====================================================== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<AppContent />} />
        <Route path="/finance" element={<AppContent />} />
        
        <Route path="/profile" element={<AppContent />} />
        <Route path="/settings" element={<AppContent />} />
        <Route path="/reports" element={<AppContent />} />
        <Route path="/attendance" element={<AppContent />} />
        <Route path="/grades" element={<AppContent />} />
        <Route path="/students" element={<AppContent />} />
        <Route path="/teachers" element={<AppContent />} />
        <Route path="/classes" element={<AppContent />} />
        <Route path="/timetable" element={<AppContent />} />
        <Route path="/certificates" element={<AppContent />} />
        <Route path="/communications" element={<AppContent />} />
        <Route path="/analytics" element={<AppContent />} />
        <Route path="/billing" element={<AppContent />} />
        <Route path="/maintenance" element={<AppContent />} />
        <Route path="/support" element={<AppContent />} />
        <Route path="/messages" element={<AppContent />} />
        <Route path="/audit" element={<AppContent />} />
        <Route path="/debug" element={<AppContent />} />
        <Route path="/transport" element={<AppContent />} />
      </Route>

      {/* ====================================================== */}
      {/* CATCH-ALL ROUTE - If no other route matches,          */}
      {/* redirect to the landing page.                         */}
      {/* ====================================================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Logic Component
const AppLogic: React.FC = () => {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
};

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <SchoolProvider>
                <NavigationProvider>
                  <AppLogic />
                </NavigationProvider>
              </SchoolProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
