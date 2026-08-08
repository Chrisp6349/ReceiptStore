import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setCustomer(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.me();
      setCustomer(me);
    } catch {
      setToken(null);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setToken(data.token);
    await loadMe();
  };

  const register = async (name, email, password) => {
    const data = await api.register({ name, email, password });
    setToken(data.token);
    await loadMe();
  };

  const logout = () => {
    setToken(null);
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ customer, loading, login, register, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
