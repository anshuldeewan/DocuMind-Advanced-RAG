"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  MonitorSmartphone, 
  Server, 
  Database, 
  Cpu, 
  Workflow
} from 'lucide-react';

interface BlockProps {
  title: string;
  icon: React.ReactNode;
  desc: string;
  delay?: number;
}

const Block = ({ title, icon, desc, delay = 0 }: BlockProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="clay-card p-6 flex flex-col items-center text-center w-64 z-10 bg-[#faf8f5]"
  >
    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-slate-200">
      {icon}
    </div>
    <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

export default function ArchitectureDiagram() {
  return (
    <div className="w-full max-w-5xl mx-auto py-16 px-4 flex flex-col items-center">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">System Architecture & Flow</h2>
        <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto">
          An advanced orchestrator architecture transforming unstructured data into precise, conversational intelligence.
        </p>
      </div>

      <div className="relative flex flex-col items-center w-full">
        {/* 1. Frontend */}
        <Block 
          title="Next.js Client" 
          desc="User uploads multimodal documents or submits queries via the interactive glassmorphic React canvas."
          icon={<MonitorSmartphone className="text-blue-500 w-6 h-6" />} 
          delay={0.1} 
        />

        {/* Desktop and Mobile Connection */}
        <div className="h-10 border-l-2 border-dashed border-slate-300 my-0" />

        {/* 2. Backend */}
        <Block 
          title="FastAPI Server" 
          desc="Handles CORS, parses payloads, and manages asynchronous API routing."
          icon={<Server className="text-orange-500 w-6 h-6" />} 
          delay={0.2} 
        />

        <div className="h-10 border-l-2 border-dashed border-slate-300 my-0" />

        {/* 3. LangGraph */}
        <Block 
          title="LangGraph Orchestrator" 
          desc="Routes the workflow, evaluates hallucination risks, and chains retrieval with generation."
          icon={<Workflow className="text-purple-500 w-6 h-6" />} 
          delay={0.3} 
        />

        {/* Mobile Vertical Flow */}
        <div className="md:hidden flex flex-col items-center w-full">
           <div className="h-10 border-l-2 border-dashed border-slate-300 my-0" />
           <Block 
            title="ChromaDB" 
            desc="MMR retrieval fetches the top 4 most diverse & relevant contextual chunks using Gemini Embeddings."
            icon={<Database className="text-emerald-500 w-6 h-6" />} 
            delay={0.4} 
          />
           <div className="h-10 border-l-2 border-dashed border-slate-300 my-0" />
           <Block 
            title="Gemini 3.1 Flash Lite" 
            desc="Reasons over the context and conversational history to generate the final formatted response."
            icon={<Cpu className="text-rose-500 w-6 h-6" />} 
            delay={0.5} 
          />
        </div>

        {/* Desktop Branching Flow */}
        <div className="hidden md:flex flex-col items-center w-full">
            <div className="h-8 border-l-2 border-dashed border-slate-300 my-0" />
            <div className="w-[288px] border-t-2 border-dashed border-slate-300 relative flex justify-between">
               <div className="h-6 border-l-2 border-dashed border-slate-300" />
               <div className="h-6 border-r-2 border-dashed border-slate-300" />
            </div>
            <div className="flex gap-8 mt-0 relative -top-[2px]">
              <Block 
                title="ChromaDB Vector Store" 
                desc="MMR retrieval fetches the top 4 most diverse & relevant contextual chunks using Gemini Embeddings."
                icon={<Database className="text-emerald-500 w-6 h-6" />} 
                delay={0.4} 
              />
              <Block 
                title="Gemini 3.1 Flash Lite" 
                desc="Reasons over the context and conversational history to generate the final formatted response."
                icon={<Cpu className="text-rose-500 w-6 h-6" />} 
                delay={0.5} 
              />
            </div>
        </div>
      </div>
    </div>
  );
}
