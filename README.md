# 🧠 DocuMind Advanced RAG Engine

[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2.60-green.svg)](https://github.com/langchain-ai/langgraph)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5.23-purple.svg)](https://www.trychroma.com/)
[![Gemini 3.1 Flash](https://img.shields.io/badge/LLM-Gemini_3.1_Flash-blue.svg)](https://aistudio.google.com/)

DocuMind is an advanced Retrieval-Augmented Generation (RAG) web application that allows you to upload multimodal documents and intuitively chat with them. It is built with a powerful Next.js frontend and a highly scalable FastAPI + LangGraph backend orchestrator.

## ✨ Features

- **Multimodal Document Parsing**: Upload PDFs, Word documents, Excel sheets, code files, and even Images.
- **Smart RAG Workflow**: Utilizes LangGraph to intelligently route queries, handle context retrieval, and gracefully fallback when needed.
- **Interactive UI Canvas**: Features a stunning, responsive, and glassmorphic UI built with Tailwind CSS, Framer Motion, and React Markdown.
- **Automatic Index Management**: Safely clears vector contamination across document sessions.
- **Dockerized Backend**: Fully isolated ChromaDB and FastAPI instance for production-ready deployment.

---

## 📸 Proof of Work

### Document Upload & Ingestion
Easily drag and drop a wide variety of documents directly into the intelligent knowledge base.
> **📷 TODO:** Take a screenshot of the working upload drag-and-drop zone and save it as `screenshots/upload.png`

### Intelligent QA Canvas
Engage in rich conversations with context-aware responses powered by Gemini 3.1 Flash Lite.
> **📷 TODO:** Take a screenshot of the beautiful chat interface and save it as `screenshots/qa.png`

### Performance & Traceability
Watch real-time latency metrics and routing evaluations directly in the conversation.
> **📷 TODO:** Take a screenshot of the evaluation metrics pills and save it as `screenshots/eval.png`

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion, Axios, React Markdown.
- **Backend**: Python, FastAPI, Uvicorn, LangChain, LangGraph, ChromaDB.
- **AI Models**: Google Gemini 3.1 Flash Lite, Gemini Embedding 001.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- A Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/anshuldeewan/DocuMind-Advanced-RAG.git
cd DocuMind-Advanced-RAG
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your API keys:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Create another `.env.local` inside the `frontend/` directory (optional):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start the Backend (Docker)
The backend service (FastAPI + ChromaDB) runs smoothly inside Docker.
```bash
docker compose up --build -d
```
The backend API will be available at `http://localhost:8000`. You can view the swagger docs at `http://localhost:8000/docs`.

### 4. Start the Frontend
In a new terminal, spin up the Next.js UI:
```bash
cd frontend
npm install
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## 👨‍💻 Built By
**Anshul Deewan**
- 💼 LinkedIn: [Anshul Deewan](https://www.linkedin.com/in/anshul-deewan/)
- 📧 Email: asharma800077@gmail.com
- 📞 Phone: +91 9166697613
