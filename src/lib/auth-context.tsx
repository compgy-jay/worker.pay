"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface AdminUser {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (password: string) => Promise<string | null>;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  token: null,
  loading: true,
  login: async () => null,
  logout: () => {},
  checkAuth: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("wp_admin");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAdmin(parsed.admin);
        setToken(parsed.token);
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (password: string): Promise<string | null> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error || "Login failed";
    setAdmin(data.admin);
    setToken(data.token);
    localStorage.setItem("wp_admin", JSON.stringify({ admin: data.admin, token: data.token }));
    return null;
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("wp_admin");
  }, []);

  const checkAuth = useCallback(() => {
    return !!admin && !!token;
  }, [admin, token]);

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
