import React from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

const statusConfig = {
  completed: {
    icon: CheckCircle,
    text: "Completed",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  transcribing: {
    icon: Loader2,
    text: "Transcribing",
    classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    spin: true,
  },
  summarizing: {
    icon: Loader2,
    text: "Summarizing",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    spin: true,
  },
  uploaded: {
    icon: Clock,
    text: "Uploaded",
    classes: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
  failed: {
    icon: AlertCircle,
    text: "Failed",
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export default function MeetingList({ meetings }) {
  if (!meetings || meetings.length === 0) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
          <CalendarDays className="h-8 w-8 text-accent/60" />
        </div>
        <p className="text-lg font-semibold text-gray-300">No meetings yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Upload a recording above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-slide-up stagger-2">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h2 className="section-title">
          <div className="p-2 rounded-lg bg-blue-500/15">
            <CalendarDays className="h-4 w-4 text-blue-400" />
          </div>
          Recent Meetings
          <span className="ml-auto text-sm font-normal text-gray-500">
            {meetings.length} total
          </span>
        </h2>
      </div>

      <ul className="divide-y divide-white/[0.04]">
        {meetings.map((meeting, idx) => {
          const cfg = statusConfig[meeting.status] || statusConfig.uploaded;
          const StatusIcon = cfg.icon;

          return (
            <li key={meeting.id}>
              <Link
                to={`/meeting/${meeting.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100 truncate group-hover:text-accent transition-colors">
                    {meeting.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-3">
                    <span>
                      {new Date(meeting.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {meeting.duration_seconds && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.round(meeting.duration_seconds / 60)} min
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`badge border ${cfg.classes}`}
                  >
                    <StatusIcon
                      className={`h-3 w-3 ${cfg.spin ? "animate-spin" : ""}`}
                    />
                    {cfg.text}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}