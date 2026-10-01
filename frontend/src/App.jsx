import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { PublicLanding } from "./pages/PublicLanding.jsx";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { FarmCreate } from "./pages/FarmCreate.jsx";
import { FarmDetail } from "./pages/FarmDetail.jsx";
import { CreateOrganization } from "./pages/CreateOrganization.jsx";
import { OrganizationDashboard } from "./pages/OrganizationDashboard.jsx";
import { OrganizationFarms } from "./pages/OrganizationFarms.jsx";
import { BulkImport } from "./pages/BulkImport.jsx";
import { OrganizationMembers } from "./pages/OrganizationMembers.jsx";
import { AlertsInbox } from "./pages/AlertsInbox.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading session...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading FarmTrack...
      </div>
    );
  }
  // If signed in, show authenticated dashboard. If visitor, show rich public landing dashboard.
  return user ? <Dashboard /> : <PublicLanding />;
}

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Home & Info */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/about" element={<PublicLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Individual Mode Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farms/new"
            element={
              <ProtectedRoute>
                <FarmCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farms/:id"
            element={
              <ProtectedRoute>
                <FarmDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-org"
            element={
              <ProtectedRoute>
                <CreateOrganization />
              </ProtectedRoute>
            }
          />

          {/* Protected Organization Mode Routes */}
          <Route
            path="/org/:id"
            element={
              <ProtectedRoute>
                <OrganizationDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/org/:id/farms"
            element={
              <ProtectedRoute>
                <OrganizationFarms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/org/:id/farms/new"
            element={
              <ProtectedRoute>
                <FarmCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/org/:id/import"
            element={
              <ProtectedRoute>
                <BulkImport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/org/:id/members"
            element={
              <ProtectedRoute>
                <OrganizationMembers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/org/:id/alerts"
            element={
              <ProtectedRoute>
                <AlertsInbox />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
