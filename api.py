import os
import time
import tempfile
import traceback
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

load_dotenv()

from multimodal_loader import MultiModalDocumentLoader
from document_processor import DocumentProcessor
from utils import clear_chroma_db
from rag_workflow import RAGWorkflow

app = FastAPI(title="DocuMind RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Initialize Loader & Processor
loader = MultiModalDocumentLoader()
processor = DocumentProcessor(document_loader=loader)

# 2. RAG Engine
rag_engine = RAGWorkflow()

class ChatMessagePayload(BaseModel):
    role: str
    content: str

class QueryRequest(BaseModel):
    query: str
    history: Optional[List[ChatMessagePayload]] = []

class QueryResponse(BaseModel):
    answer: str
    latency: float
    sources: List[str]
    faithfulness_score: float
    route: str

@app.get("/")
def read_root():
    return {"status": "online", "system": "DocuMind Advanced RAG Engine"}

@app.post("/api/reset")
async def reset_database():
    try:
        clear_chroma_db()
        return {"status": "success", "message": "Knowledge base reset successfully."}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to reset database: {str(e)}")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), overwrite: bool = True):
    temp_path = None
    try:
        suffix = Path(file.filename).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            contents = await file.read()
            tmp.write(contents)
            temp_path = tmp.name

        if overwrite:
            clear_chroma_db()

        # Process and index file
        chunks_count = processor.process_file_api(temp_path, file.filename)

        return {
            "status": "success",
            "filename": file.filename,
            "chunks_count": chunks_count,
            "message": f"Successfully parsed and indexed {chunks_count} chunks from {file.filename}."
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@app.post("/api/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    start_time = time.time()
    try:
        history_dicts = [msg.model_dump() for msg in (request.history or [])]
        result = rag_engine.process_question(request.query, history=history_dicts)
        latency = time.time() - start_time

        answer = result.get("generation", "") or result.get("answer", "No answer generated.")
        raw_docs = result.get("documents", [])
        
        sources = []
        for doc in raw_docs:
            if hasattr(doc, "page_content"):
                sources.append(doc.page_content[:400] + "...")
            elif isinstance(doc, str):
                sources.append(doc[:400] + "...")

        return QueryResponse(
            answer=answer,
            latency=round(latency, 2),
            sources=sources,
            faithfulness_score=float(result.get("faithfulness_score", 0.95)),
            route=str(result.get("route", "Vector Store"))
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")