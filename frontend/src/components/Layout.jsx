import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
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

  return (
    <div className="min-h-screen flex relative">
      {/* ── Cursor glow (app-wide) ─────────────────────────── */}
      <CursorGlow size={500} color="rgba(124,92,252,0.06)" />

      {/* ── Ambient glow orbs with parallax depth ──────────── */}
      <ParallaxLayer depth={15} className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute top-1/3 -right-32 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-72 h-72 bg-emerald-500/6 rounded-full blur-3xl animate-pulse-slow"
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
        className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] z-50 flex flex-col bg-surface-900/80 backdrop-blur-2xl border-r border-white/[0.06] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/30 rounded-lg blur-md" />
            <div className="relative bg-gradient-to-br from-accent to-blue-500 p-2 rounded-lg">
              <Mic className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">Meeting Intelligence</span>
            <span className="inline-flex items-center gap-1 ml-1.5 text-[9px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
              <Sparkles className="h-2 w-2" /> AI
            </span>
          </div>
          {/* Close on mobile */}
          <button
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4 text-gray-400" />
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
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
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
        <div className="border-t border-white/[0.06] p-3 flex-shrink-0 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
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
        <header className="sticky top-0 z-30 bg-surface-900/70 backdrop-blur-2xl border-b border-white/[0.06] h-16 flex items-center px-4 sm:px-6 lg:px-8 flex-shrink-0">
          <button
            className="lg:hidden p-2 -ml-2 mr-3 rounded-xl hover:bg-white/[0.06] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-gray-400" />
          </button>

          {/* Page Title */}
          <h2 className="text-lg font-bold text-white tracking-tight">
            {navItems.find((n) => n.path === location.pathname)?.label || "Meeting Intelligence"}
          </h2>

          {/* Right side — user pill */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-surface-800/60 backdrop-blur-sm border border-white/[0.06] px-3 py-1.5 rounded-full">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="text-xs font-medium text-gray-300">{user?.name}</span>
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