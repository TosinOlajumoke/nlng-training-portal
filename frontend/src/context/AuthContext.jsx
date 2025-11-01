import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if(user) localStorage.setItem("auth_user", JSON.stringify(user)); else localStorage.removeItem("auth_user"); }, [user]);
  useEffect(() => { if(token) localStorage.setItem("auth_token", token); else localStorage.removeItem("auth_token"); }, [token]);
  useEffect(() => {
  if (token) {
    fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }
}, [token]);

  const login = useCallback((userData, authToken) => { setUser(userData); setToken(authToken); }, []);
  const logout = useCallback(() => { setUser(null); setToken(null); localStorage.removeItem("auth_user"); localStorage.removeItem("auth_token"); }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading, setLoading, login, logout,
      isAuthenticated: !!token, role: user?.role || null
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
