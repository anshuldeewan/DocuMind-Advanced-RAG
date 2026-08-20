# DocuMind Advanced RAG: Project Brief

## 1. Project Overview
**DocuMind** is a full-stack, multi-modal, conversational Retrieval-Augmented Generation (RAG) system. It allows users to ingest complex documents (text, code, PDFs, spreadsheets, and images) and converse with an AI about the contents of those documents through a modern, highly interactive web interface.

## 2. What Kind of RAG is It?
This is an **Advanced, Multi-Turn RAG System**. 
Unlike basic RAG setups that do simple vector searches on single queries, this system features:
- **Conversational Memory:** The system retains the last 6 turns of the chat history and injects it into the LLM prompt, allowing for contextual follow-up questions (e.g., "Tell me more about that").
- **Maximum Marginal Relevance (MMR) Retrieval:** Instead of just grabbing the top $K$ most similar chunks (which often results in redundant information), the retriever fetches a larger pool of candidates (12) and then algorithmically selects the 4 most *relevant yet diverse* chunks. This deduplicates the context window and provides a richer knowledge base for the LLM.
- **Multi-Modal Ingestion:** The data ingestion pipeline isn't limited to plain text. It handles PDFs, Word docs, CSV/Excel sheets, code files, and even images.
- **Telemetry & Evaluation:** The backend calculates and returns metadata like request latency, the routing path taken, and a mock faithfulness/confidence score for the generated answer.

## 3. System Architecture & How it Works

### Backend (Python / FastAPI / LangChain)
- **Framework:** FastAPI (`api.py`) exposes two main endpoints: `/api/upload` (for document ingestion) and `/api/query` (for chat).
- **LLM & Embeddings:** Powered entirely by Google's Gemini ecosystem. It uses `models/gemini-embedding-001` for vectorizing text and `gemini-3.1-flash-lite` as the core reasoning engine.
- **Vector Database:** `langchain_chroma` (ChromaDB) is used as the local vector store, persisting data to a `./.chroma` directory.
- **Document Processing (`multimodal_loader.py` & `document_processor.py`):** 
  - Uploaded files are routed to specific loaders based on their extension.
  - Documents are split using a `RecursiveCharacterTextSplitter` configured for high quality: `chunk_size=800`, `chunk_overlap=80`, smart separators (newlines, bullet points, periods), and aggressive whitespace stripping to prevent chunks from starting mid-sentence.
- **RAG Workflow (`rag_workflow.py`):**
  1. Receives a user query and the chat history.
  2. Dynamically loads the ChromaDB collection.
  3. Uses MMR to retrieve 4 diverse document chunks.
  4. Formats the chunks into a context string.
  5. Formats the chat history into a conversational string.
  6. Constructs a final prompt combining Context, History, and the Current Question, and invokes Gemini.

### Frontend (React / Next.js / Tailwind CSS)
- **Design System:** Uses a custom "claymorphism/glassmorphism" aesthetic with vibrant gradients, soft inner shadows (`clay-card`, `clay-badge`), and smooth Framer Motion animations.
- **Document Ingestion (`DocumentIngestion.tsx`):** A drag-and-drop zone using `react-dropzone`. Once a file is processed, the filename is hoisted to the global page state.
- **Chat Interface (`QACanvas.tsx`):** A sophisticated, ChatGPT-style multi-turn chat feed.
  - **Markdown Support:** Renders answers with `react-markdown` and `@tailwindcss/typography` so bolding, lists, and code blocks look perfect.
  - **Expandable Sources:** Users can click to reveal the exact source chunks the LLM used. These chunks are rendered as compact, scrollable cards to save vertical space.
  - **Persistence:** Chat history is automatically synced to the browser's `localStorage` so conversations survive page refreshes.
  - **Export:** Users can click "Export Chat" to download the entire conversation (including telemetry and retrieved sources) as a clean `.md` Markdown file.

## 4. What We Have Done / Fixed So Far
During our recent development sessions, we significantly upgraded the codebase:
1. **Resolved Import & Case Errors:** Fixed a server-crashing typo involving `MultiModalDocumentLoader`.
2. **Standardized LLM Models:** Hardcoded the stack to use `gemini-3.1-flash-lite` to bypass experimental quota limits and 503 errors encountered with other model versions.
3. **Fixed Pydantic Validation Errors:** Fixed a bug in the RAG workflow where Gemini returned a list of blocks instead of a string, which was crashing the FastAPI `/api/query` endpoint.
4. **Improved Chunking:** Replaced a basic token splitter with a robust `RecursiveCharacterTextSplitter` (800 chars / 80 overlap) for cleaner, more logical text segments.
5. **Upgraded to MMR Retrieval:** Switched from basic similarity search to MMR in `rag_workflow.py` to eliminate duplicate chunks.
6. **Built the Multi-Turn Chat UI:** Completely rewrote the frontend from a single-shot Q&A box into a scrolling, multi-message chat thread with user/assistant bubbles, typing indicators, and markdown rendering.
7. **Added Memory to Backend:** Updated the FastAPI schemas and the LangChain prompt to accept and process chat history.
8. **Added Persistence & Export:** Implemented `localStorage` syncing and the Markdown export feature in the frontend.
9. **UI Polish:** Restyled the retrieved source chunks into compact, scrollable cards with elegant badges.

## 5. What is Possible (Future Features)
Because the foundation is now so robust, you can easily extend this system to include:
- **Multi-Document Chat:** Currently, the UI focuses on the last uploaded document. You could update the ChromaDB setup to query across *all* ingested documents simultaneously.
- **Streaming Responses:** Implementing Server-Sent Events (SSE) in FastAPI to stream the LLM response token-by-token to the frontend for a faster perceived response time.
- **Agentic RAG / Tool Calling:** Giving the Gemini model access to tools (like searching the web, querying a SQL database, or doing math) if the answer isn't found in the vector store.
- **User Authentication & Cloud DB:** Moving from `localStorage` to a Postgres database to save chat histories linked to user accounts.
