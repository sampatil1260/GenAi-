import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchMeetings } from "../api/client";
import { Link } from "react-router-dom";
import FloatingShapes from "../components/3d/FloatingShapes";
import {
  Search, Send, Sparkles, User, Loader2, MessageSquare, FileSearch,
} from "lucide-react";

const examplePrompts = [
  "What tasks were assigned in last week's meeting?",
  "Summarize the key decisions made recently",
  "Who was assigned the most action items?",
  "What topics were discussed about the AI project?",
];

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSearch = async (query) => {
    const q = (query || input).trim();
    if (!q || loading) return;

    const userMsg = { role: "user", content: q, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const results = await searchMeetings(q);
      const aiAnswer = results?.[0]?.answer;
      const aiMsg = {
        role: "ai",
        content: aiAnswer || "I couldn't find relevant information for that query. Try asking about a specific topic or meeting.",
        sources: results || [],
        id: Date.now() + 1,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: err.response?.data?.detail || "Search failed. Please try again.",
          sources: [],
          id: Date.now() + 1,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-8rem)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4 px-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center relative">
            {/* 3D floating shapes in background */}
            <FloatingShapes count={5} className="opacity-30" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-2xl" />
                <div className="relative bg-gradient-to-br from-accent to-blue-500 p-5 rounded-3xl">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Search Your Meetings</h2>
              <p className="text-gray-400 max-w-md mb-8">
                Ask anything about your past meetings — powered by AI semantic search. Your conversations are processed to give you intelligent answers.
              </p>

              {/* Example prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {examplePrompts.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    onClick={() => { setInput(prompt); handleSearch(prompt); }}
                    className="glass-card-hover p-3 text-left text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="text-accent mr-1.5">→</span>
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] lg:max-w-[70%] ${msg.role === "user" ? "order-2" : ""}`}>
                  {/* Avatar + message */}
                  <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-accent to-blue-500"
                        : "bg-gradient-to-br from-emerald-500 to-cyan-500"
                    }`}>
                      {msg.role === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-white" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-accent/15 border border-accent/20"
                        : msg.isError
                        ? "bg-red-500/10 border border-red-500/20"
                        : "glass-card"
                    }`}>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.isError ? "text-red-400" : "text-gray-200"
                      }`}>
                        {msg.content}
                      </p>
                    </div>
                  </div>

                  {/* Sources */}
                  {msg.role === "ai" && msg.sources?.length > 0 && (
                    <div className="mt-3 ml-11 space-y-2">
                      <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                        <FileSearch className="h-3 w-3" /> Sources ({msg.sources.length})
                      </p>
                      {msg.sources.slice(0, 3).map((s, i) => (
                        <Link
                          key={i}
                          to={`/meeting/${s.meeting_id}`}
                          className="block glass-card-hover p-3 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-accent font-semibold">{s.meeting_title}</span>
                            <span className="text-gray-500 font-mono">{(s.similarity_score * 100).toFixed(1)}%</span>
                          </div>
                          <p className="text-gray-400 line-clamp-2">{s.relevant_chunk}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="glass-card px-5 py-3 flex items-center gap-1.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-2 w-2 rounded-full bg-accent/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">Searching meetings...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-white/[0.06] pt-4 mt-auto">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              ref={inputRef}
              id="chat-search-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your meetings..."
              disabled={loading}
              className="glass-input w-full pl-11 pr-4"
            />
          </div>
          <motion.button
            id="chat-search-submit"
            type="submit"
            disabled={loading || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary px-4 flex items-center justify-center"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
