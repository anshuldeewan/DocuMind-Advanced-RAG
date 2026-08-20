"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Send,
  Clock,
  Compass,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Bot,
  Download,
  Trash2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  latency?: number;
  sources?: string[];
  faithfulness_score?: number;
  route?: string;
  timestamp: string;
}

interface QACanvasProps {
  ingestedFilename?: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STORAGE_KEY = "documind_chat_history";

const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="my-5 rounded-xl overflow-hidden bg-[#1e1e1e] border border-slate-700/50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-slate-700/50">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <div className="p-4 overflow-x-auto text-sm font-mono text-slate-50">
          <code className={className} {...props}>
            {children}
          </code>
        </div>
      </div>
    );
  }

  return (
    <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-slate-200" {...props}>
      {children}
    </code>
  );
};

export default function QACanvas({ ingestedFilename }: QACanvasProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    new Set()
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch {
      // localStorage might be unavailable
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // localStorage might be full or unavailable
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    setExpandedSources(new Set());
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportChat = () => {
    if (messages.length === 0) return;

    const lines: string[] = [
      "# DocuMind — Chat Export",
      `**Exported:** ${new Date().toLocaleString()}`,
      ingestedFilename ? `**Document:** ${ingestedFilename}` : "",
      "",
      "---",
      "",
    ];

    for (const msg of messages) {
      const time = formatTime(msg.timestamp);
      if (msg.role === "user") {
        lines.push(`### 🧑 You  _(${time})_`);
        lines.push("", msg.content, "");
      } else {
        lines.push(`### 🤖 DocuMind  _(${time})_`);
        if (msg.latency !== undefined || msg.route || msg.faithfulness_score !== undefined) {
          const badges: string[] = [];
          if (msg.latency !== undefined) badges.push(`Latency: ${msg.latency}s`);
          if (msg.route) badges.push(`Route: ${msg.route}`);
          if (msg.faithfulness_score !== undefined) badges.push(`Faithfulness: ${Math.round(msg.faithfulness_score * 100)}%`);
          lines.push(`> ${badges.join(" · ")}`);
          lines.push("");
        }
        lines.push(msg.content, "");
        if (msg.sources && msg.sources.length > 0) {
          lines.push("<details>", `<summary>📎 ${msg.sources.length} Retrieved Source Chunks</summary>`, "");
          msg.sources.forEach((src, i) => {
            lines.push(`**Chunk ${i + 1}:**`, "```", src, "```", "");
          });
          lines.push("</details>", "");
        }
      }
      lines.push("---", "");
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documind-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetKnowledgeBase = async () => {
    if (!window.confirm("Are you sure you want to reset the knowledge base? This will clear all ingested documents.")) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await axios.post(`${API_URL}/api/reset`);
      alert("Knowledge base reset successfully!");
      // Also clear chat when resetting knowledge base
      clearChat();
    } catch (error) {
      console.error("Failed to reset knowledge base:", error);
      alert("Failed to reset knowledge base. See console for details.");
    }
  };

  const toggleSources = (messageId: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);
    setError(null);

    try {
      // Build history from existing messages for conversational context
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/api/query`, {
        query: userMessage.content,
        history,
      });

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: response.data.answer,
        latency: response.data.latency,
        sources: response.data.sources,
        faithfulness_score: response.data.faithfulness_score,
        route: response.data.route,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Query Error:", err);
      setError(
        err.response?.data?.detail ||
          "An error occurred while processing your query."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Interactive Query Canvas
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          Ask anything. Watch the LangGraph engine evaluate and route your
          request.
        </p>

        {/* Action Buttons */}
        {messages.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              type="button"
              onClick={exportChat}
              className="clay-badge flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Chat
            </button>
            <button
              type="button"
              onClick={clearChat}
              className="clay-badge flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Chat
            </button>
            <button
              type="button"
              onClick={resetKnowledgeBase}
              className="clay-badge flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-orange-500 hover:text-orange-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Index
            </button>
          </div>
        )}
      </div>

      {/* Chat Feed */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-[320px] max-h-[560px] overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin"
      >
        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="clay-card p-6 rounded-2xl mb-4">
              <Bot className="w-10 h-10 text-slate-400 mx-auto" />
            </div>
            <p className="text-slate-500 text-sm max-w-md">
              {ingestedFilename
                ? `Your document is ready. Ask a question about "${ingestedFilename}".`
                : "Upload a document above, then ask questions about it here."}
            </p>
          </div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "user" ? (
                /* ── User Bubble ── */
                <div className="flex items-end gap-2 max-w-[75%]">
                  <div className="clay-card rounded-2xl rounded-br-md px-5 py-3 bg-gradient-to-br from-orange-50 to-amber-50">
                    <p className="text-slate-800 text-sm leading-relaxed">
                      {msg.content}
                    </p>
                    <span className="block text-[10px] text-slate-400 mt-1.5 text-right">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              ) : (
                /* ── Assistant Card ── */
                <div className="flex items-start gap-2 max-w-[90%] w-full">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-sm mt-1">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="clay-card rounded-2xl rounded-bl-md p-5 bg-[#faf8f5] flex-1 space-y-4">
                    {/* Telemetry Row */}
                    <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200/60 text-[11px] font-medium text-slate-600">
                      {msg.latency !== undefined && (
                        <div className="flex items-center gap-1 bg-amber-100/60 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            <strong className="text-slate-800">
                              {msg.latency}s
                            </strong>
                          </span>
                        </div>
                      )}
                      {msg.route && (
                        <div className="flex items-center gap-1 bg-blue-100/60 px-2.5 py-1 rounded-lg">
                          <Compass className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            <strong className="text-slate-800">
                              {msg.route}
                            </strong>
                          </span>
                        </div>
                      )}
                      {msg.faithfulness_score !== undefined && (
                        <div className="flex items-center gap-1 bg-emerald-100/60 px-2.5 py-1 rounded-lg">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            <strong className="text-slate-800">
                              {Math.round(msg.faithfulness_score * 100)}%
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Markdown Answer */}
                    <div className="prose prose-slate max-w-none w-full text-slate-800 leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          code: CodeBlock,
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 shadow-sm">
                              <table className="min-w-full border-collapse text-sm text-left" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => <thead className="bg-slate-50 text-slate-700 border-b border-slate-200" {...props} />,
                          th: ({ node, ...props }) => <th className="p-3 font-semibold border-r border-slate-200 last:border-0" {...props} />,
                          td: ({ node, ...props }) => <td className="p-3 border-r border-slate-200 last:border-0 border-b" {...props} />,
                          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-slate-800" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-slate-800 border-b pb-2 border-slate-100" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-slate-800" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-4 space-y-1.5 marker:text-slate-400" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-4 space-y-1.5 marker:text-slate-400" {...props} />,
                          li: ({ node, ...props }) => <li className="text-slate-700 pl-1" {...props} />,
                          p: ({ node, ...props }) => <p className="my-3 text-slate-700 leading-relaxed" {...props} />,
                          a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-800 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-slate-300 pl-4 py-1 my-4 text-slate-600 italic bg-slate-50 rounded-r-md" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Sources Accordion */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => toggleSources(msg.id)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <span>
                            {expandedSources.has(msg.id) ? "Hide" : "View"}{" "}
                            {msg.sources.length} Retrieved Source Chunks
                          </span>
                          {expandedSources.has(msg.id) ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <AnimatePresence>
                          {expandedSources.has(msg.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 max-h-52 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                                {msg.sources.map((src, idx) => (
                                  <div
                                    key={idx}
                                    className="relative p-3 bg-slate-50 border border-slate-200/80 rounded-xl max-h-32 overflow-y-auto scrollbar-thin"
                                  >
                                    <span className="inline-block mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                      Chunk {idx + 1}
                                    </span>
                                    <p className="text-[11px] text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
                                      {src}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Timestamp */}
                    <span className="block text-[10px] text-slate-400">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-sm">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="clay-card rounded-2xl rounded-bl-md px-5 py-4 bg-[#faf8f5]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="clay-card rounded-2xl p-3 bg-red-50 text-red-600 text-sm text-center mb-3">
          {error}
        </div>
      )}

      {/* Pinned Document Badge + Input Bar */}
      <div className="sticky bottom-0 pt-2">
        {ingestedFilename && (
          <div className="flex items-center justify-center mb-2">
            <div className="clay-badge flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-slate-600">
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              <span>
                Ingested Context:{" "}
                <strong className="text-slate-800">{ingestedFilename}</strong>
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleQuery} className="relative">
          <div className="clay-card rounded-3xl p-2 flex items-center bg-[#faf8f5]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about the ingested documents..."
              className="w-full bg-transparent px-6 py-4 text-slate-800 placeholder-slate-400 focus:outline-none text-base"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg disabled:opacity-50 transition-all hover:scale-105"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
