"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ParticleCanvas from '@/components/ParticleCanvas';
import Hero from '@/components/Hero';
import FeatureCards from '@/components/FeatureCards';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';
import DocumentIngestion from '@/components/DocumentIngestion';
import QACanvas from '@/components/QACanvas';

export default function Home() {
  const [ingestedFilename, setIngestedFilename] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Automatically reset the backend index on page load/refresh
    const resetIndexOnLoad = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await axios.post(`${API_URL}/api/reset`);
        console.log("Database index automatically reset on page refresh.");
      } catch (error) {
        console.error("Failed to reset index on page load:", error);
      }
    };
    
    resetIndexOnLoad();
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col">
      {/* Background Layer */}
      <ParticleCanvas />
      
      {/* Content Layers */}
      <div className="relative z-10 w-full flex-grow flex flex-col">
        <Hero />
        
        <div className="w-full max-w-6xl mx-auto px-4 mb-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-clay-shadow)] to-transparent opacity-50" />
        </div>
        
        <section id="knowledge-base" className="w-full flex flex-col items-center">
          <DocumentIngestion onFileIngested={(name) => setIngestedFilename(name)} />
          
          <QACanvas ingestedFilename={ingestedFilename} onFileIngested={(name) => setIngestedFilename(name)} />
        </section>
        
        <div className="w-full max-w-4xl mx-auto px-4 my-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-clay-shadow)] to-transparent opacity-50" />
        </div>
        
        <section id="architecture" className="w-full flex flex-col items-center pt-16 -mt-16">
          <ArchitectureDiagram />
          <FeatureCards />
        </section>
        
        {/* Footer spacing */}
        <div className="h-32 w-full" />
      </div>
    </main>
  );
}
