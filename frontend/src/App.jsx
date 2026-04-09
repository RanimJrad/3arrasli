import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Home from "./Home";
import { hasRole, getStoredUser } from "./services/auth";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import SignupPage from "./pages/SignupPage";
const RequireRole = ({ role, children }) => {
  const user = getStoredUser();

  if (!hasRole(user, role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isSplashExiting, setIsSplashExiting] = useState(false);
  const exitTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const triggerSplash = () => {
    window.clearTimeout(exitTimerRef.current);
    window.clearTimeout(hideTimerRef.current);

    setShowSplash(true);
    setIsSplashExiting(false);

    exitTimerRef.current = window.setTimeout(() => {
      setIsSplashExiting(true);
    }, 2000);

    hideTimerRef.current = window.setTimeout(() => {
      setShowSplash(false);
    }, 2500);
  };

  const handleLogoClick = () => {
    triggerSplash();
  };

  useEffect(() => {
    triggerSplash();

    return () => {
      window.clearTimeout(exitTimerRef.current);
      window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <BrowserRouter>
      {showSplash ? <SplashScreen isExiting={isSplashExiting} /> : null}
      <Routes>
        <Route path="/" element={<Home onLogoClick={handleLogoClick} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<RequireRole role="Admin"><AdminDashboard /></RequireRole>} />
        <Route path="/prestataire" element={<RequireRole role="Prestataire"><ProviderDashboard /></RequireRole>} />
        <Route path="/provider" element={<Navigate to="/prestataire" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

