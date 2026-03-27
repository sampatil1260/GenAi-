import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import CursorGlow from "./3d/CursorGlow";
import ParallaxLayer from "./3d/ParallaxLayer";
import {
  Home,
  Upload,
  Clock,
  Search,
  Settings,
  LogOut,
  Mic,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/upload", label: "Upload Meeting", icon: Upload },
  { path: "/history", label: "Meeting History", icon: Clock },
  { path: "/search", label: "Search Meetings", icon: Search },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex relative ${isDark ? "bg-surface-950" : "bg-surface-light-50"}`}>
      {/* ── Cursor glow (app-wide) ─────────────────────────── */}
      <CursorGlow
        size={500}
        color={isDark ? "rgba(124,92,252,0.06)" : "rgba(124,92,252,0.03)"}
      />

      {/* ── Ambient glow orbs with parallax depth ──────────── */}
      <ParallaxLayer depth={15} className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse-slow ${isDark ? "bg-accent/10" : "bg-accent/5"}`} />
        <div
          className={`absolute top-1/3 -right-32 w-80 h-80 rounded-full blur-3xl animate-pulse-slow ${isDark ? "bg-blue-500/8" : "bg-blue-400/5"}`}
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className={`absolute -bottom-20 left-1/3 w-72 h-72 rounded-full blur-3xl animate-pulse-slow ${isDark ? "bg-emerald-500/6" : "bg-emerald-400/3"}`}
          style={{ animationDelay: "3s" }}
        />
      </ParallaxLayer>

      {/* ── Mobile overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] z-50 flex flex-col backdrop-blur-2xl border-r transition-all duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isDark
            ? "bg-surface-900/80 border-white/[0.06]"
            : "bg-white/80 border-surface-light-300/40"
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 h-16 border-b flex-shrink-0 ${isDark ? "border-white/[0.06]" : "border-surface-light-300/40"}`}>
          <div className="relative">
            <div className="absolute inset-0 bg-accent/30 rounded-lg blur-md" />
            <div className="relative bg-gradient-to-br from-accent to-blue-500 p-2 rounded-lg">
              <Mic className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <span className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}>Meeting Intelligence</span>
            <span className="inline-flex items-center gap-1 ml-1.5 text-[9px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
              <Sparkles className="h-2 w-2" /> AI
            </span>
          </div>
          {/* Close on mobile */}
          <button
            className={`ml-auto lg:hidden p-1 rounded-lg transition-colors ${isDark ? "hover:bg-white/[0.06]" : "hover:bg-gray-100"}`}
            onClick={() => setSidebarOpen(false)}
          >
            <X className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-accent/15 text-accent shadow-sm shadow-accent/10"
                    : isDark
                    ? "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                {label}
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 ml-auto text-accent/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className={`border-t p-3 flex-shrink-0 space-y-1 ${isDark ? "border-white/[0.06]" : "border-surface-light-300/40"}`}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-800"}`}>{user?.name}</p>
              <p className={`text-[11px] truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>{user?.email}</p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={`sticky top-0 z-30 backdrop-blur-2xl border-b h-16 flex items-center px-4 sm:px-6 lg:px-8 flex-shrink-0 ${
          isDark
            ? "bg-surface-900/70 border-white/[0.06]"
            : "bg-white/70 border-surface-light-300/40"
        }`}>
          <button
            className={`lg:hidden p-2 -ml-2 mr-3 rounded-xl transition-colors ${isDark ? "hover:bg-white/[0.06]" : "hover:bg-gray-100"}`}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className={`h-5 w-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          </button>

          {/* Page Title */}
          <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}>
            {navItems.find((n) => n.path === location.pathname)?.label || "Meeting Intelligence"}
          </h2>

          {/* Right side — theme toggle + user pill */}
          <div className="ml-auto flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isDark
                  ? "bg-surface-800/60 border border-white/[0.06] hover:bg-surface-700/60 text-amber-400"
                  : "bg-surface-light-200/60 border border-surface-light-300/40 hover:bg-surface-light-300/60 text-indigo-500"
              }`}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User pill */}
            <div className={`hidden sm:flex items-center gap-2 backdrop-blur-sm border px-3 py-1.5 rounded-full ${
              isDark
                ? "bg-surface-800/60 border-white/[0.06]"
                : "bg-white/60 border-surface-light-300/40"
            }`}>
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}