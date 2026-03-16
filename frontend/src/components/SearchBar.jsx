import React, { useState } from "react";
import { Search, Loader2, MessageSquare, Sparkles, FileSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { searchMeetings } from "../api/client";

/**
 * RAG-powered semantic search across all past meetings.
 * Displays the AI-generated answer + relevant transcript chunks.
 */
export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const data = await searchMeetings(query.trim());
      setResults(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Search failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const aiAnswer = results?.[0]?.answer;

  return (
    <div className="space-y-6">
      {/* ── Search Input ────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            id="search-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Ask anything — e.g., "What was discussed about the AI project?"'
            className="glass-input w-full pl-12 pr-4"
          />
        </div>
        <button
          id="search-submit-btn"
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>
      </form>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* ── AI Answer ───────────────────────────────────────── */}
      {aiAnswer && (
        <div className="glass-card p-6 border-accent/20 animate-slide-up">
          <h3 className="font-bold text-white flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-blue-500/20">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            AI Answer
          </h3>
          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">
            {aiAnswer}
          </p>
        </div>
      )}

      {/* ── Source Chunks ───────────────────────────────────── */}
      {results && results.length > 0 && (
        <div className="space-y-3 animate-slide-up stagger-2">
          <h3 className="font-bold text-white flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-gray-400" />
            Source Excerpts
            <span className="text-sm font-normal text-gray-500 ml-1">
              ({results.length})
            </span>
          </h3>

          {results.map((result, idx) => (
            <div
              key={idx}
              className="glass-card-hover p-4"
            >
              <div className="flex items-center justify-between mb-2.5">
                <Link
                  to={`/meeting/${result.meeting_id}`}
                  className="text-sm font-semibold text-accent hover:text-accent-light transition-colors"
                >
                  {result.meeting_title}
                </Link>
                <span className="text-xs text-gray-500 font-mono">
                  {(result.similarity_score * 100).toFixed(1)}% match
                </span>
              </div>
              <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                {result.relevant_chunk}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── No Results ──────────────────────────────────────── */}
      {results && results.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <Search className="h-10 w-10 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 font-medium">No matching meetings found</p>
          <p className="text-sm text-gray-500 mt-1">Try a different query.</p>
        </div>
      )}
    </div>
  );
}