import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff } from "lucide-react";
import FloatingShapes from "../components/3d/FloatingShapes";
import ParticleField from "../components/3d/ParticleField";
import TiltCard from "../components/3d/TiltCard";
import CursorGlow from "../components/3d/CursorGlow";

export default function LoginPage() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to log in";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-4">
      {/* ── Background Layers ─────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 ${isDark ? "bg-surface-950" : "bg-surface-light-50"}`} />
        <motion.div
          className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? "bg-gradient-to-br from-accent/20 to-blue-600/10" : "bg-gradient-to-br from-accent/10 to-blue-400/5"}`}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl ${isDark ? "bg-gradient-to-tr from-blue-500/15 to-purple-600/10" : "bg-gradient-to-tr from-blue-400/8 to-purple-400/5"}`}
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <FloatingShapes count={8} className="-z-5" />
      <ParticleField className="-z-5 opacity-60" />
      <CursorGlow size={600} color={isDark ? "rgba(124,92,252,0.08)" : "rgba(124,92,252,0.04)"} />

      {/* ── Login Card ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <TiltCard tiltIntensity={8} className="group">
          <div className={`backdrop-blur-2xl border rounded-3xl shadow-2xl p-8 ${
            isDark
              ? "bg-surface-800/50 border-white/[0.08] shadow-black/40"
              : "bg-white/70 border-surface-light-300/40 shadow-accent/5"
          }`}>
            {/* Logo */}
            <motion.div
              className="flex flex-col items-center mb-8"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-accent/30 rounded-2xl blur-xl" />
                <div className="relative bg-gradient-to-br from-accent to-blue-500 p-4 rounded-2xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}>Welcome Back</h1>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Sign in to your Meeting Intelligence account</p>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="glass-input w-full pl-11"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="glass-input w-full pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <motion.button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className={`flex-1 h-px ${isDark ? "bg-white/[0.06]" : "bg-surface-light-300/40"}`} />
              <span className={`text-xs uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}>or</span>
              <div className={`flex-1 h-px ${isDark ? "bg-white/[0.06]" : "bg-surface-light-300/40"}`} />
            </div>

            <p className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-accent hover:text-accent-light font-semibold transition-colors">
                Create new account
              </Link>
            </p>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
}
