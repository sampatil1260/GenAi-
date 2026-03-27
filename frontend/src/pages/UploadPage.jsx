import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { uploadMeeting } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import TiltCard from "../components/3d/TiltCard";
import AnimatedBackground from "../components/3d/AnimatedBackground";
import {
  Upload, Loader2, CheckCircle, AlertCircle, Video, FileText, Lightbulb,
  CheckSquare, ChevronDown, ChevronUp, User, Flag,
} from "lucide-react";

const priorityStyles = {
  high: "bg-red-500/15 text-red-400 border border-red-500/20",
  medium: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  low: "bg-gray-500/15 text-gray-400 border border-gray-500/20",
};

export default function UploadPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [result, setResult] = useState(null);

  // Collapsible sections
  const [showTranscript, setShowTranscript] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        if (!title) {
          const name = acceptedFiles[0].name.replace(/\.[^/.]+$/, "");
          setTitle(name.replace(/[_-]/g, " "));
        }
      }
    },
    [title]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mkv", ".mov", ".avi"],
      "audio/*": [".wav", ".mp3", ".m4a", ".webm", ".ogg"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setStatus("uploading");
    setError("");
    setProgress("Uploading file...");
    setProgressPct(10);

    try {
      const stages = [
        { msg: "🎬 Extracting audio from video...", pct: 25, delay: 3000 },
        { msg: "🎤 Transcribing with Whisper...", pct: 45, delay: 8000 },
        { msg: "🤖 Generating AI summary...", pct: 65, delay: 15000 },
        { msg: "📋 Extracting action items...", pct: 80, delay: 20000 },
        { msg: "🔍 Building search index...", pct: 92, delay: 25000 },
      ];
      stages.forEach(({ msg, pct, delay }) => {
        setTimeout(() => { setProgress(msg); setProgressPct(pct); }, delay);
      });

      const data = await uploadMeeting(title.trim(), file);
      setStatus("success");
      setProgressPct(100);
      setProgress("Complete!");
      setResult(data);
    } catch (err) {
      setStatus("error");
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
      setProgress("");
      setProgressPct(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle("");
    setStatus("idle");
    setError("");
    setProgress("");
    setProgressPct(0);
    setResult(null);
  };

  return (
    <motion.div
      className="space-y-8 max-w-3xl mx-auto relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* 3D Animated Background */}
      <AnimatedBackground variant="particles" className="opacity-40" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}>Upload Meeting</h1>
        <p className={`mt-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Upload an audio or video recording and let AI extract insights.</p>
      </motion.div>

      {/* Upload Card — wrapped in TiltCard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <TiltCard tiltIntensity={6} className="group">
          <div className={`glass-card p-6 ${status === "uploading" ? "shimmer-border" : ""}`}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className={`text-sm font-medium mb-2 block ${isDark ? "text-gray-300" : "text-gray-600"}`}>Meeting Title</label>
            <input
              id="upload-title-input"
              type="text"
              placeholder="Sprint Planning — Week 12"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full"
              required
              disabled={status === "uploading"}
            />
          </div>

          {/* Dropzone */}
          <div>
            <label className={`text-sm font-medium mb-2 block ${isDark ? "text-gray-300" : "text-gray-600"}`}>Recording File</label>
            <div
              {...getRootProps()}
              className={`group relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-accent bg-accent/5 scale-[1.01]"
                  : file
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : isDark
                  ? "border-white/[0.08] hover:border-accent/40 hover:bg-accent/5"
                  : "border-surface-light-300/60 hover:border-accent/40 hover:bg-accent/5"
              } ${status === "uploading" ? "pointer-events-none opacity-60" : ""}`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="text-emerald-400">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 animate-fade-in" />
                  <p className="font-semibold text-lg">{file.name}</p>
                  <p className="text-sm text-emerald-400/70 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB — Click or drop to replace
                  </p>
                </div>
              ) : (
                <div className={`transition-colors ${isDark ? "text-gray-500 group-hover:text-gray-300" : "text-gray-400 group-hover:text-gray-600"}`}>
                  <Video className="h-10 w-10 mx-auto mb-3 group-hover:text-accent transition-colors" />
                  <p className="font-semibold text-lg">Drop your video or audio file here</p>
                  <p className="text-sm mt-1">MP4, MKV, MOV, AVI, WAV, MP3, M4A — up to 100 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {status === "uploading" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>{progress}</span>
                <span className="text-accent font-mono text-xs">{progressPct}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-surface-700" : "bg-surface-light-200"}`}>
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-blue-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            id="upload-submit-btn"
            type="submit"
            disabled={!file || !title.trim() || status === "uploading" || status === "success"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {status === "uploading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Upload Complete
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload & Process
              </>
            )}
          </motion.button>

          {/* Error */}
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </form>
          </div>
        </TiltCard>
      </motion.div>

      {/* ── Results ──────────────────────────────────────────── */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Success banner */}
            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Meeting processed successfully!</p>
                <p className="text-emerald-400/70 text-xs mt-0.5">Your transcript, summary, and action items are ready.</p>
              </div>
              <button
                onClick={() => navigate(`/meeting/${result.id}`)}
                className="ml-auto text-emerald-300 hover:text-white text-xs font-semibold transition-colors"
              >
                View Full Details →
              </button>
            </div>

            {/* Summary Section */}
            <CollapsibleSection
              title="Meeting Summary"
              icon={<Lightbulb className="h-4 w-4 text-yellow-400" />}
              iconBg="bg-yellow-500/15"
              isOpen={showSummary}
              onToggle={() => setShowSummary(!showSummary)}
              isDark={isDark}
            >
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                {result.summary?.summary || "Summary not available."}
              </p>
            </CollapsibleSection>

            {/* Tasks Section */}
            <CollapsibleSection
              title={`Action Items (${result.action_items?.length || 0})`}
              icon={<CheckSquare className="h-4 w-4 text-emerald-400" />}
              iconBg="bg-emerald-500/15"
              isOpen={showTasks}
              onToggle={() => setShowTasks(!showTasks)}
              isDark={isDark}
            >
              {result.action_items?.length > 0 ? (
                <div className="space-y-2">
                  {result.action_items.map((task, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-xl p-3 border ${isDark ? "bg-surface-900/50 border-white/[0.04]" : "bg-surface-light-100/50 border-surface-light-300/30"}`}>
                      <div className="p-1.5 rounded-lg bg-accent/10"><User className="h-3 w-3 text-accent" /></div>
                      <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{task.assignee}</span>
                      <span className="text-gray-600 text-sm">→</span>
                      <p className={`text-sm flex-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{task.task}</p>
                      <span className={`badge text-[11px] ${priorityStyles[task.priority] || priorityStyles.medium}`}>
                        <Flag className="h-3 w-3" />{task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No action items extracted.</p>
              )}
            </CollapsibleSection>

            {/* Transcript Section */}
            <CollapsibleSection
              title="Full Transcript"
              icon={<FileText className="h-4 w-4 text-accent" />}
              iconBg="bg-accent/15"
              isOpen={showTranscript}
              onToggle={() => setShowTranscript(!showTranscript)}
              isDark={isDark}
            >
              <div className={`rounded-xl p-4 border max-h-[400px] overflow-y-auto ${isDark ? "bg-surface-900/60 border-white/[0.04]" : "bg-surface-light-100/60 border-surface-light-300/30"}`}>
                <p className={`whitespace-pre-wrap text-sm leading-relaxed font-light ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {result.transcript || "Transcript not available."}
                </p>
              </div>
            </CollapsibleSection>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleReset} className={`btn-ghost border ${isDark ? "border-white/[0.08]" : "border-surface-light-300/40"}`}>
                Upload Another
              </button>
              <button
                onClick={() => navigate(`/meeting/${result.id}`)}
                className="btn-primary"
              >
                View Full Meeting Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CollapsibleSection({ title, icon, iconBg, isOpen, onToggle, isDark, children }) {
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2.5 px-6 py-4 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50"}`}
      >
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{title}</span>
        <div className="ml-auto">
          {isOpen ? <ChevronUp className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} /> : <ChevronDown className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
