import React from "react";
import { FileText, Lightbulb, Target, Star, Zap } from "lucide-react";

/**
 * Renders the full detail view of a single meeting:
 * transcript, summary, key points, decisions, and highlights.
 */
export default function MeetingDetail({ meeting, summary }) {
  if (!meeting) return null;

  return (
    <div className="space-y-6">
      {/* ── Summary Panel ──────────────────────────────────── */}
      {summary && (
        <>
          {/* Topic & Summary */}
          <section className="glass-card p-6 animate-slide-up stagger-1">
            <h3 className="section-title mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/15">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
              </div>
              {summary.topic || "Meeting Summary"}
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
              {summary.summary}
            </p>
          </section>

          {/* Key Points, Decisions, Highlights — 3-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard
              title="Key Points"
              icon={<Target className="h-4 w-4" />}
              items={summary.key_points}
              emptyText="No key points extracted."
              accentClass="text-blue-400 bg-blue-500/15"
              dotColor="bg-blue-400"
              delay="stagger-2"
            />
            <InfoCard
              title="Decisions"
              icon={<Zap className="h-4 w-4" />}
              items={summary.decisions}
              emptyText="No decisions recorded."
              accentClass="text-emerald-400 bg-emerald-500/15"
              dotColor="bg-emerald-400"
              delay="stagger-3"
            />
            <InfoCard
              title="Highlights"
              icon={<Star className="h-4 w-4" />}
              items={summary.highlights}
              emptyText="No highlights found."
              accentClass="text-purple-400 bg-purple-500/15"
              dotColor="bg-purple-400"
              delay="stagger-4"
            />
          </div>
        </>
      )}

      {/* ── Transcript Panel ───────────────────────────────── */}
      <section className="glass-card p-6 animate-slide-up stagger-5">
        <h3 className="section-title mb-4">
          <div className="p-2 rounded-lg bg-accent/15">
            <FileText className="h-4 w-4 text-accent" />
          </div>
          Full Transcript
        </h3>
        {meeting.transcript ? (
          <div className="bg-surface-900/60 rounded-xl p-5 border border-white/[0.04] max-h-[600px] overflow-y-auto">
            <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-light">
              {meeting.transcript}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm">
            Transcript not available yet.
          </p>
        )}
      </section>
    </div>
  );
}

/** Reusable card for rendering a list of bullet points. */
function InfoCard({ title, icon, items, emptyText, accentClass, dotColor, delay }) {
  return (
    <div className={`glass-card p-5 animate-slide-up ${delay}`}>
      <h4 className="font-bold text-white flex items-center gap-2.5 mb-4 text-sm">
        <div className={`p-1.5 rounded-lg ${accentClass}`}>{icon}</div>
        {title}
      </h4>
      {items && items.length > 0 ? (
        <ul className="space-y-2.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span
                className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotColor}`}
              />
              <span className="text-sm text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">{emptyText}</p>
      )}
    </div>
  );
}