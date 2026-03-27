import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Clock, Calendar, Loader2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import MeetingDetail from "../components/MeetingDetail";
import TaskList from "../components/TaskList";
import { getMeeting, getMeetingSummary, deleteMeeting } from "../api/client";

/**
 * Single meeting view — shows transcript, summary, and action items.
 */
export default function MeetingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [meeting, setMeeting] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingData, summaryData] = await Promise.all([
          getMeeting(id),
          getMeetingSummary(id),
        ]);
        setMeeting(meetingData);
        setSummary(summaryData);
      } catch (err) {
        console.error("Failed to load meeting:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this meeting and all its data?")) return;
    try {
      await deleteMeeting(id);
      navigate("/");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className={`flex items-center gap-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
          Loading meeting...
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className={`text-center py-32 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Meeting not found.</div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            id="back-to-dashboard-btn"
            onClick={() => navigate("/")}
            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/[0.06]" : "hover:bg-gray-100"}`}
          >
            <ArrowLeft className={`h-5 w-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          </button>
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}>
              {meeting.title}
            </h1>
            <div className={`flex items-center gap-4 text-sm mt-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(meeting.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {meeting.duration_seconds && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {Math.round(meeting.duration_seconds / 60)} minutes
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          id="delete-meeting-btn"
          onClick={handleDelete}
          className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          title="Delete meeting"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* ── Action Items ───────────────────────────────────── */}
      <TaskList tasks={meeting.action_items} />

      {/* ── Summary & Transcript ────────────────────────────── */}
      <MeetingDetail meeting={meeting} summary={summary} />
    </div>
  );
}