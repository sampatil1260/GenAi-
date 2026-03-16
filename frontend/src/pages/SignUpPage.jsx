import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, UserPlus, Sparkles, Eye, EyeOff } from "lucide-react";
import FloatingShapes from "../components/3d/FloatingShapes";
import ParticleField from "../components/3d/ParticleField";
import TiltCard from "../components/3d/TiltCard";
import CursorGlow from "../components/3d/CursorGlow";

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPw) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setLoading(true);
    try {
      signup(name.trim(), email.trim().toLowerCase(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-4">
      {/* ── 3D Background Layers ─────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-surface-950" />
        <motion.div
          className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-purple-600/20 to-accent/10 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-500/15 to-emerald-500/8 blur-3xl"
          animate={{ x: [0, 25, 0], y: [0, -20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 3D Floating shapes */}
      <FloatingShapes count={8} className="-z-5" />

      {/* Particle field */}
      <ParticleField className="-z-5 opacity-60" />

      {/* Cursor glow */}
      <CursorGlow size={600} color="rgba(124,92,252,0.08)" />

      {/* ── Signup Card with 3D Tilt ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <TiltCard tiltIntensity={8} className="group">
          <div className="bg-surface-800/50 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/40 p-8">
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
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h1>
              <p className="text-gray-400 text-sm mt-1">Join Meeting Intelligence — powered by AI</p>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name" required className="glass-input w-full pl-11" />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" required className="glass-input w-full pl-11" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input id="signup-password" type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)"
                  required className="glass-input w-full pl-11 pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input id="signup-confirm-password" type={showPw ? "text" : "password"} value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm Password"
                  required className="glass-input w-full pl-11" />
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      password.length >= i * 3 ? i <= 1 ? "bg-red-500" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-blue-400" : "bg-emerald-400" : "bg-white/[0.06]"
                    }`} />
                  ))}
                </div>
              )}

              <motion.button id="signup-submit-btn" type="submit" disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><UserPlus className="h-4 w-4" /> Create Account</>
                )}
              </motion.button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:text-accent-light font-semibold transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
}
