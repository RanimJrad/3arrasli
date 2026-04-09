import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./Home";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import SignupPage from "./pages/SignupPage";
import { getStoredUser, hasRole } from "./services/auth";

const RequireRole = ({ role, children }) => {
  const user = getStoredUser();

  if (!hasRole(user, role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/admin"
          element={
            <RequireRole role="Admin">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/prestataire"
          element={
            <RequireRole role="Prestataire">
              <ProviderDashboard />
            </RequireRole>
          }
        />
        <Route path="/provider" element={<Navigate to="/prestataire" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
