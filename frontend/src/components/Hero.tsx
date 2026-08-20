"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative z-10 pt-32 pb-16 px-4 max-w-5xl mx-auto flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="clay-badge px-6 py-2 mb-8 inline-flex items-center gap-2"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-coral)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-accent-coral)]"></span>
        </span>
        <span className="text-sm font-semibold tracking-wide text-[var(--color-text-secondary)]">
          ⚡ Powered by Gemini 1.5 & LangGraph
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        DocuMind Advanced <span className="text-[var(--color-accent-coral)]">RAG</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-lg md:text-xl max-w-2xl text-[var(--color-text-muted)] leading-relaxed"
      >
        Intelligent multi-modal document search and analysis engine. 
        Experience enterprise-grade retrieval with hallucination detection and self-correction.
      </motion.p>
    </section>
  );
}
