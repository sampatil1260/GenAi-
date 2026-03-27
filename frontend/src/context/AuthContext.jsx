import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, signupUser } from "../api/client";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const TOKEN_KEY = "ami_token";
const SESSION_KEY = "ami_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const session = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (token && session?.email) {
        setUser(session);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const signup = async (name, email, password) => {
    const data = await signupUser(name, email, password);
    // Store JWT token and user session
    localStorage.setItem(TOKEN_KEY, data.token);
    const session = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      createdAt: data.user.createdAt,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    // Store JWT token and user session
    localStorage.setItem(TOKEN_KEY, data.token);
    const session = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      createdAt: data.user.createdAt,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    // Profile updates remain local for now
    // In production, add a PATCH /api/v1/users/me endpoint
    if (updates.name) {
      const updatedSession = { ...user, name: updates.name };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      setUser(updatedSession);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
