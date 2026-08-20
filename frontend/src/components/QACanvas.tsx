"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Activity, Clock, ShieldCheck, Route as RouteIcon, Search, FileText } from 'lucide-react';
import axios from 'axios';

interface Telemetry {
  latency: string;
  search_method: string;
  faithfulness_score: number | string;
}

export default function QACanvas() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:8000/api/query', { query });
      setResult({
        answer: response.data.answer || response.data.generation || response.data.solution || "",
        latency: response.data.latency || 0,
        sources: response.data.sources || [],
        faithfulness_score: response.data.faithfulness_score || 0.95,
        route: response.data.route || response.data.search_method || "vectorstore"
      });
    } catch (error) {
      console.error(error);
      setResult({
        answer: "Sorry, an error occurred while processing your query.",
        latency: 0,
        sources: [],
        faithfulness_score: 0,
        route: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative z-10 py-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Interactive Query Canvas</h2>
        <p className="text-[var(--color-text-muted)]">Ask anything. Watch the LangGraph engine evaluate and route your request.</p>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-12 flex items-center justify-center">
        <div className="relative w-full max-w-3xl flex items-center">
          <div className="absolute left-6 text-[var(--color-text-muted)]">
            <Search size={24} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about the ingested documents..."
            className="w-full py-5 pl-16 pr-20 text-lg font-medium text-[var(--color-text-primary)] clay-inset outline-none focus:ring-2 focus:ring-[var(--color-accent-amber)]/50 placeholder:text-[var(--color-text-muted)]/70 transition-all"
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-4 p-3 clay-button text-[var(--color-accent-coral)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Activity size={24} className="animate-pulse" /> : <Send size={24} />}
          </motion.button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="clay-card p-8 mb-8 relative overflow-hidden flex flex-col gap-4"
          >
             <div className="h-6 w-1/3 bg-[var(--color-clay-shadow)]/20 animate-pulse rounded-md"></div>
             <div className="h-4 w-full bg-[var(--color-clay-shadow)]/10 animate-pulse rounded-md"></div>
             <div className="h-4 w-5/6 bg-[var(--color-clay-shadow)]/10 animate-pulse rounded-md"></div>
             <div className="h-4 w-4/6 bg-[var(--color-clay-shadow)]/10 animate-pulse rounded-md"></div>
          </motion.div>
        )}
        
        {result && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="clay-card p-8 relative overflow-hidden"
          >
            {/* Live Telemetry Row */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-[var(--color-clay-shadow)]/30">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                <Clock size={16} className="text-[var(--color-accent-amber)]" />
                <span>Latency: {result.latency}{typeof result.latency === 'number' ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                <RouteIcon size={16} className="text-[var(--color-accent-sage)]" />
                <span>Route: {result.route === 'online' ? 'Tavily Search' : 'ChromaDB Retriever'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                <ShieldCheck size={16} className="text-[var(--color-accent-coral)]" />
                <span>Faithfulness: {result.faithfulness_score !== 'N/A' ? `${(Number(result.faithfulness_score) * 100).toFixed(0)}%` : 'N/A'}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-[var(--color-text-primary)]">
              <div className="whitespace-pre-wrap leading-relaxed">
                {result.answer}
              </div>
            </div>

            {/* Source Chunks Viewer */}
            {result.sources && result.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[var(--color-clay-shadow)]/30">
                <details className="group">
                  <summary className="flex items-center gap-2 font-semibold text-[var(--color-text-secondary)] cursor-pointer list-none select-none">
                    <FileText size={18} />
                    <span>View Sourced Chunks ({result.sources.length})</span>
                    <span className="ml-auto transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="mt-4 flex flex-col gap-3">
                    {result.sources.map((source: string, idx: number) => (
                      <div key={idx} className="p-4 clay-inset text-sm text-[var(--color-text-muted)] line-clamp-4 leading-relaxed">
                        {source}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
