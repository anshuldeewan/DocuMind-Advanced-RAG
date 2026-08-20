"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function DocumentIngestion() {
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg(response.data.message || "File indexed successfully!");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to upload and process file.");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt', '.md', '.py', '.js', '.ts', '.css', '.html', '.json', '.yaml', '.yml'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    }
  });

  return (
    <section className="relative z-10 py-12 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Knowledge Ingestion</h2>
        <p className="text-[var(--color-text-muted)]">Upload a document to update the brain's context.</p>
      </div>

      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`clay-inset p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'bg-[#ede8df]' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="animate-spin text-[var(--color-accent-sage)] mb-4" />
            <p className="text-[var(--color-text-secondary)] font-medium">Parsing and Chunking...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center">
            <UploadCloud size={48} className="text-[var(--color-accent-amber)] mb-4 animate-bounce" />
            <p className="text-[var(--color-text-secondary)] font-medium">Drop the files here ...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud size={48} className="text-[var(--color-text-muted)] mb-4" />
            <p className="text-[var(--color-text-secondary)] font-medium mb-2">Drag & drop a file here, or click to select</p>
            <div className="flex gap-2 mt-4 flex-wrap justify-center max-w-lg">
              <span className="clay-badge text-xs px-3 py-1 text-[var(--color-text-muted)]">PDF</span>
              <span className="clay-badge text-xs px-3 py-1 text-[var(--color-text-muted)]">DOCX</span>
              <span className="clay-badge text-xs px-3 py-1 text-[var(--color-text-muted)]">Excel/CSV</span>
              <span className="clay-badge text-xs px-3 py-1 text-[var(--color-text-muted)]">Images</span>
              <span className="clay-badge text-xs px-3 py-1 text-[var(--color-text-muted)]">Code/Text</span>
            </div>
          </div>
        )}
      </motion.div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center justify-center gap-2 text-[var(--color-accent-sage)] font-semibold">
          <CheckCircle size={20} />
          {successMsg}
        </motion.div>
      )}

      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center text-[var(--color-accent-coral)] font-semibold">
          {errorMsg}
        </motion.div>
      )}
    </section>
  );
}
