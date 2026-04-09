import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";
import { clearStoredUser, getStoredSession, saveStoredUser } from "../services/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(getStoredSession());

  const login = async (credentials) => {
    const response = await api.post("/api/auth/login", credentials);
    const nextSession = {
      user: response.data.user,
      token: response.data.token,
    };
    saveStoredUser(nextSession);
    setSession(nextSession);
    return response.data;
  };

  const signup = async (payload) => {
    const response = await api.post("/api/auth/register", payload);
    const nextSession = {
      user: response.data.user,
      token: response.data.token,
    };
    saveStoredUser(nextSession);
    setSession(nextSession);
    return response.data;
  };

  const logout = () => {
    clearStoredUser();
    setSession(null);
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      token: session?.token || "",
      isAuthenticated: Boolean(session?.token),
      login,
      signup,
      logout,
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
