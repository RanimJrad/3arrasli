import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import Home from "./Home";
<<<<<<< HEAD
import { useAuth } from "./context/AuthContext";
=======
import { hasRole, getStoredUser } from "./services/auth";
>>>>>>> bd2db821f100514414b08d51bcff83e77a84069d
import AdminDashboard from "./pages/AdminDashboard";
import BookingPage from "./pages/BookingPage";
import ChatPage from "./pages/ChatPage";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/LoginPage";
import PaymentsPage from "./pages/PaymentsPage";
import PlannerPage from "./pages/PlannerPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderDetailsPage from "./pages/ProviderDetailsPage";
import ProvidersPage from "./pages/ProvidersPage";
import SignupPage from "./pages/SignupPage";
const RequireRole = ({ role, children }) => {
  const user = getStoredUser();

  if (!hasRole(user, role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/providers/:providerId" element={<ProviderDetailsPage />} />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <PlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/provider" element={<ProviderDashboard />} />
        </Route>
=======
        <Route path="/" element={<Home onLogoClick={handleLogoClick} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<RequireRole role="Admin"><AdminDashboard /></RequireRole>} />
        <Route path="/prestataire" element={<RequireRole role="Prestataire"><ProviderDashboard /></RequireRole>} />
        <Route path="/provider" element={<Navigate to="/prestataire" replace />} />
>>>>>>> bd2db821f100514414b08d51bcff83e77a84069d
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

