import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Simple hash for demo — replace with bcrypt on a real backend
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

const USERS_KEY = "ami_users";
const SESSION_KEY = "ami_session";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (session?.email) setUser(session);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const signup = (name, email, password) => {
    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error("An account with this email already exists.");
    }
    const newUser = {
      name,
      email,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const session = { name: newUser.name, email: newUser.email, createdAt: newUser.createdAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const login = (email, password) => {
    const users = getUsers();
    const found = users.find(
      (u) => u.email === email && u.passwordHash === simpleHash(password)
    );
    if (!found) throw new Error("Invalid email or password.");
    const session = { name: found.name, email: found.email, createdAt: found.createdAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const updateProfile = (updates) => {
    const users = getUsers();
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx === -1) throw new Error("User not found.");

    if (updates.name) {
      users[idx].name = updates.name;
    }
    if (updates.newPassword) {
      if (users[idx].passwordHash !== simpleHash(updates.currentPassword)) {
        throw new Error("Current password is incorrect.");
      }
      users[idx].passwordHash = simpleHash(updates.newPassword);
    }
    saveUsers(users);
    const session = { name: users[idx].name, email: users[idx].email, createdAt: users[idx].createdAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
