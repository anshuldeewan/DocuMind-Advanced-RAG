import React from 'react';
import { GitBranch, BookOpen, Mail, Phone } from 'lucide-react';

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

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const techStack = [
    "LangGraph", "Next.js", "FastAPI", "ChromaDB", "Tailwind CSS"
  ];

  return (
    <footer className="w-full bg-[#faf8f5] border-t border-slate-200/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Copyright & Built with */}
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <span>© {currentYear} DocuMind.</span>
              <span className="text-slate-500">
                Built by Anshul Deewan
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
              <a href="mailto:asharma800077@gmail.com" className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                asharma800077@gmail.com
              </a>
              <a href="tel:+919166697613" className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                +91 9166697613
              </a>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {techStack.map((tech) => (
              <span 
                key={tech}
                className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-500 bg-white border border-slate-200 rounded-md shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a 
              href="http://localhost:8000/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              API Docs
            </a>
            <a 
              href="https://github.com/anshuldeewan/DocuMind-Advanced-RAG" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-700 transition-colors"
              title="GitHub Repository"
            >
              <GitBranch className="w-5 h-5" />
            </a>
            <a 
              href="https://www.linkedin.com/in/anshul-deewan/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#0a66c2] transition-colors"
              title="LinkedIn Profile"
            >
              <LinkedinIcon className="w-5 h-5" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
