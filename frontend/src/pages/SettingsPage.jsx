import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import TiltCard from "../components/3d/TiltCard";
import {
  User, Lock, Mail, Calendar, CheckCircle, AlertCircle, Save, Eye, EyeOff, Shield,
} from "lucide-react";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();

  // Profile
  const [name, setName] = useState(user?.name || "");
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setProfileMsg({ type: "error", text: "Name must be at least 2 characters." });
      return;
    }
    try {
      updateProfile({ name: name.trim() });
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setProfileMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    }
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (!currentPw) {
      setPwMsg({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    try {
      updateProfile({ currentPassword: currentPw, newPassword: newPw });
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setPwMsg({ type: "error", text: err.message });
    }
  };

  return (
    <motion.div
      className="space-y-8 max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-1.5">Manage your profile and account preferences.</p>
      </motion.div>

      {/* ── Account Info ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <TiltCard tiltIntensity={6} glowColor="rgba(59,130,246,0.3)" className="group">
          <div className="glass-card p-6">
        <h2 className="section-title mb-5">
          <div className="p-2 rounded-lg bg-blue-500/15"><Shield className="h-4 w-4 text-blue-400" /></div>
          Account Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-900/50 rounded-xl p-4 border border-white/[0.04]">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Mail className="h-3 w-3" /> EMAIL
            </div>
            <p className="text-sm text-gray-200 font-medium">{user?.email}</p>
          </div>
          <div className="bg-surface-900/50 rounded-xl p-4 border border-white/[0.04]">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Calendar className="h-3 w-3" /> MEMBER SINCE
            </div>
            <p className="text-sm text-gray-200 font-medium">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                : "—"}
            </p>
          </div>
        </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* ── Profile Section ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <TiltCard tiltIntensity={6} glowColor="rgba(124,92,252,0.3)" className="group">
          <div className="glass-card p-6">
        <h2 className="section-title mb-5">
          <div className="p-2 rounded-lg bg-accent/15"><User className="h-4 w-4 text-accent" /></div>
          Profile
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Display Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full pl-11"
                placeholder="Your name"
              />
            </div>
          </div>

          <StatusMessage msg={profileMsg} />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </motion.button>
        </form>
          </div>
        </TiltCard>
      </motion.div>

      {/* ── Password Section ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <TiltCard tiltIntensity={6} glowColor="rgba(251,191,36,0.3)" className="group">
          <div className="glass-card p-6">
        <h2 className="section-title mb-5">
          <div className="p-2 rounded-lg bg-amber-500/15"><Lock className="h-4 w-4 text-amber-400" /></div>
          Change Password
        </h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          {/* Current */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="settings-current-pw"
                type={showPw ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="glass-input w-full pl-11 pr-11"
                placeholder="Current password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="settings-new-pw"
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="glass-input w-full pl-11"
                placeholder="New password (min 6 characters)"
              />
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="settings-confirm-pw"
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="glass-input w-full pl-11"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <StatusMessage msg={pwMsg} />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Update Password
          </motion.button>
        </form>
          </div>
        </TiltCard>
      </motion.div>
    </motion.div>
  );
}

function StatusMessage({ msg }) {
  if (!msg.text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${
        msg.type === "success"
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          : "bg-red-500/10 border border-red-500/20 text-red-400"
      }`}
    >
      {msg.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {msg.text}
    </motion.div>
  );
}
