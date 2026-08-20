"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Route, ShieldCheck } from 'lucide-react';

const features = [
  {
    title: "Multi-Format Parser",
    description: "Ingest PDFs, Word docs, code files, and images seamlessly into the knowledge base.",
    icon: <FileText size={32} className="text-[var(--color-accent-amber)]" />
  },
  {
    title: "Dynamic Routing",
    description: "Intelligently routes between local vector retrieval and live online Tavily search.",
    icon: <Route size={32} className="text-[var(--color-accent-sage)]" />
  },
  {
    title: "Faithfulness Correction",
    description: "Self-evaluates LLM generations to prevent hallucinations before they reach you.",
    icon: <ShieldCheck size={32} className="text-[var(--color-accent-coral)]" />
  }
];

export default function FeatureCards() {
  return (
    <section className="relative z-10 py-16 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="clay-card flex flex-col items-start p-8"
          >
            <div className="mb-4 p-3 clay-inset rounded-2xl">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">
              {feature.title}
            </h3>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
