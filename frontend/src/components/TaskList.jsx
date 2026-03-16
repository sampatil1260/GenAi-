import React from "react";
import { CheckSquare, User, Flag } from "lucide-react";

/**
 * Displays extracted action items in a styled table.
 * Shows: Assignee → Task with priority badges.
 */
const priorityStyles = {
  high: "bg-red-500/15 text-red-400 border border-red-500/20",
  medium: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  low: "bg-gray-500/15 text-gray-400 border border-gray-500/20",
};

export default function TaskList({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="glass-card p-6 animate-slide-up">
        <h3 className="section-title mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/15">
            <CheckSquare className="h-4 w-4 text-emerald-400" />
          </div>
          Action Items
        </h3>
        <p className="text-gray-500 italic text-sm">
          No action items extracted.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-slide-up stagger-1">
      <h3 className="section-title mb-5">
        <div className="p-2 rounded-lg bg-emerald-500/15">
          <CheckSquare className="h-4 w-4 text-emerald-400" />
        </div>
        Action Items
        <span className="badge bg-accent/10 text-accent border border-accent/20 ml-auto text-xs">
          {tasks.length} items
        </span>
      </h3>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 bg-surface-900/50 rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-all group"
          >
            {/* Assignee */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <User className="h-3.5 w-3.5 text-accent" />
              </div>
              <span className="text-sm font-semibold text-white">
                {task.assignee}
              </span>
            </div>

            {/* Arrow */}
            <span className="text-gray-600 text-sm">→</span>

            {/* Task description */}
            <p className="text-sm text-gray-300 flex-1">{task.task}</p>

            {/* Priority badge */}
            <span
              className={`badge text-[11px] ${
                priorityStyles[task.priority] || priorityStyles.medium
              }`}
            >
              <Flag className="h-3 w-3" />
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}