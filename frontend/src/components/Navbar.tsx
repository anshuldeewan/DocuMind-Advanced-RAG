import React from 'react';
import { BrainCircuit, GitBranch, Activity, Database, LayoutTemplate } from 'lucide-react';

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#faf8f5]/80 border-b border-slate-200/50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-1.5 rounded-lg shadow-sm">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">DocuMind</span>
            
            {/* Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-emerald-100/50 border border-emerald-200/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">System Online</span>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              <a href="#knowledge-base" className="hover:text-slate-800 transition-colors flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                Knowledge Base
              </a>
              <a href="#architecture" className="hover:text-slate-800 transition-colors flex items-center gap-1.5">
                <LayoutTemplate className="w-4 h-4" />
                Architecture
              </a>
            </div>
            
            <a 
              href="https://github.com/anshuldeewan/DocuMind-Advanced-RAG" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-semibold"
            >
              <GitBranch className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            
            <a 
              href="https://www.linkedin.com/in/anshul-deewan/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a66c2]/10 text-[#0a66c2] hover:bg-[#0a66c2]/20 transition-colors text-sm font-semibold"
            >
              <LinkedinIcon className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
}
