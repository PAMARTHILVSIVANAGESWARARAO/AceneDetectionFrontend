import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch { return null; }
  };

  const [token, setToken] = useState(() => {
    const rawToken = localStorage.getItem("acnepilot_token");
    if (!rawToken) return null;
    const decoded = decodeJWT(rawToken);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("acnepilot_token");
      localStorage.removeItem("acnepilot_user");
      return null;
    }
    return rawToken;
  });

  const [user, setUser] = useState(() => {
    const rawToken = localStorage.getItem("acnepilot_token");
    if (!rawToken) return null;
    const decoded = decodeJWT(rawToken);
    if (!decoded || decoded.exp * 1000 < Date.now()) return null;
    try {
      const stored = localStorage.getItem("acnepilot_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (jwtToken, userData = null) => {
    localStorage.setItem("acnepilot_token", jwtToken);
    setToken(jwtToken);
    if (userData) {
      localStorage.setItem("acnepilot_user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem("acnepilot_token");
    localStorage.removeItem("acnepilot_user");
    localStorage.removeItem("acnepilot_last_route");
    sessionStorage.removeItem("acnepilot_status_cache");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
      window.location.href = "/login";
    };
    window.addEventListener("auth:logout", handleLogoutEvent);
    return () => window.removeEventListener("auth:logout", handleLogoutEvent);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
