import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getMeetings } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import AnimatedBackground from "../components/3d/AnimatedBackground";
import {
  Search, Clock, ChevronRight, ChevronLeft, CheckCircle, Loader2,
  AlertCircle, CalendarDays, FileText, CheckSquare, Filter,
} from "lucide-react";

const PAGE_SIZE = 10;

const statusConfig = {
  completed: { icon: CheckCircle, text: "Completed", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  transcribing: { icon: Loader2, text: "Transcribing", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20", spin: true },
  summarizing: { icon: Loader2, text: "Summarizing", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", spin: true },
  uploaded: { icon: Clock, text: "Uploaded", cls: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  failed: { icon: AlertCircle, text: "Failed", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function HistoryPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchMeetings = useCallback(async () => {
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  // Filter
  const filtered = meetings.filter((m) => {
    const matchesSearch = m.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={`h-8 w-48 rounded-xl animate-pulse ${isDark ? "bg-surface-700/50" : "bg-surface-light-200"}`} />
        <div className={`glass-card h-96 animate-pulse`} />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* 3D Animated Background */}
      <AnimatedBackground variant="grid" className="opacity-30" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}>Meeting History</h1>
        <p className={`mt-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Browse and search all your processed meetings.</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            id="history-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search meetings..."
            className="glass-input w-full pl-11"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <select
            id="history-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input pl-10 pr-8 appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="transcribing">Transcribing</option>
            <option value="summarizing">Summarizing</option>
            <option value="uploaded">Uploaded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Table header */}
        <div className={`hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-semibold uppercase tracking-wider ${
          isDark ? "border-white/[0.06] text-gray-500" : "border-surface-light-300/40 text-gray-400"
        }`}>
          <div className="col-span-3">Meeting Name</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Transcript</div>
          <div className="col-span-2">Summary</div>
          <div className="col-span-1">Tasks</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1" />
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="p-12 text-center">
            <Search className={`h-10 w-10 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
            <p className={`font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>No meetings found</p>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <ul className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-surface-light-200"}`}>
            {paginated.map((m) => {
              const cfg = statusConfig[m.status] || statusConfig.uploaded;
              const StatusIcon = cfg.icon;
              return (
                <li key={m.id}>
                  <Link
                    to={`/meeting/${m.id}`}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-6 py-4 transition-all duration-200 group ${
                      isDark ? "hover:bg-white/[0.03]" : "hover:bg-accent/[0.03]"
                    }`}
                  >
                    {/* Name */}
                    <div className="md:col-span-3">
                      <p className={`text-sm font-semibold truncate group-hover:text-accent transition-colors ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                        {m.title}
                      </p>
                    </div>

                    {/* Date */}
                    <div className={`md:col-span-2 flex items-center gap-1.5 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      <CalendarDays className="h-3 w-3 hidden md:block" />
                      {new Date(m.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </div>

                    {/* Transcript preview */}
                    <div className="md:col-span-2">
                      <p className={`text-xs truncate flex items-center gap-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        <FileText className="h-3 w-3 flex-shrink-0 hidden md:block" />
                        {m.transcript ? m.transcript.slice(0, 50) + "..." : "—"}
                      </p>
                    </div>

                    {/* Summary preview */}
                    <div className="md:col-span-2">
                      <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {m.summary?.summary ? m.summary.summary.slice(0, 50) + "..." : "—"}
                      </p>
                    </div>

                    {/* Tasks count */}
                    <div className={`md:col-span-1 flex items-center gap-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      <CheckSquare className="h-3 w-3 hidden md:block" />
                      {m.action_items?.length || 0}
                    </div>

                    {/* Status */}
                    <div className="md:col-span-1">
                      <span className={`badge border text-[11px] ${cfg.cls}`}>
                        <StatusIcon className={`h-3 w-3 ${cfg.spin ? "animate-spin" : ""}`} />
                        <span className="hidden lg:inline">{cfg.text}</span>
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="md:col-span-1 flex justify-end">
                      <ChevronRight className={`h-4 w-4 group-hover:text-accent group-hover:translate-x-0.5 transition-all ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-6 py-3 border-t ${isDark ? "border-white/[0.06]" : "border-surface-light-200"}`}>
            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${isDark ? "hover:bg-white/[0.06]" : "hover:bg-gray-100"}`}
              >
                <ChevronLeft className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                Math.max(0, page - 3), Math.min(totalPages, page + 2)
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                    p === page ? "bg-accent/15 text-accent" : isDark ? "text-gray-500 hover:bg-white/[0.06]" : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${isDark ? "hover:bg-white/[0.06]" : "hover:bg-gray-100"}`}
              >
                <ChevronRight className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
