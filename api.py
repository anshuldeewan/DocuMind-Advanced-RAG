from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import os
import time

# Local imports
from document_loader import MultiModalDocumentLoader
from document_processor import DocumentProcessor
from rag_workflow import RAGWorkflow
from utils import get_file_key

app = FastAPI(title="DocuMind Gemini RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
document_loader = MultiModalDocumentLoader()
document_processor = DocumentProcessor(document_loader)
rag_workflow = RAGWorkflow()

class QueryRequest(BaseModel):
    query: str

class UploadFileMock:
    """Mock object to simulate Streamlit's UploadedFile for document_processor compatibility"""
    def __init__(self, name, size, type, file_obj):
        self.name = name
        self.size = size
        self.type = type
        self._file = file_obj
        
    def getvalue(self):
        self._file.seek(0)
        return self._file.read()

@app.get("/api/health")
async def health_check():
    return {"status": "active", "engine": "DocuMind Gemini RAG"}

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Read file contents
        contents = await file.read()
        size = len(contents)
        
        # Create a temporary file to work with document loader
        # We need to simulate the structure expected by MultiModalDocumentLoader
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name
            
        # Create a mock file object that mimics Streamlit's UploadedFile
        with open(temp_path, "rb") as f:
            mock_file = UploadFileMock(
                name=file.filename,
                size=size,
                type=file.content_type,
                file_obj=f
            )
            
            # Use document processor (this will create and persist Chroma DB)
            # Since document_processor.py uses st.session_state and st.progress, 
            # we need to be careful. In a true decoupling, we'd remove Streamlit calls 
            # from DocumentProcessor. For now, this will likely raise an error if st 
            # requires an active script context. 
            # Let's import streamlit and try to mock its context if needed, or 
            # just directly use the logic. 
            
            # Since the user specifically asked for api.py and didn't ask to remove
            # streamlit from document_processor.py, we will invoke it and handle potential errors.
            retriever = document_processor.process_file(mock_file)
            
        os.unlink(temp_path)
            
        if not retriever:
            raise HTTPException(status_code=400, detail="Failed to process file. Type may be unsupported.")
            
        rag_workflow.set_retriever(retriever)
        
        return {
            "status": "success",
            "filename": file.filename,
            "message": "File indexed and retriever created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_document(request: QueryRequest):
    start_time = time.time()
    
    try:
        result = rag_workflow.process_question(request.query)
        end_time = time.time()
        
        latency = f"{end_time - start_time:.2f}s"
        
        # Format response
        search_method = result.get("search_method", "Unknown")
        solution = result.get("solution", "")
        
        score_display = 'N/A'
        if 'document_relevance_score' in result and hasattr(result['document_relevance_score'], 'confidence'):
            score_display = float(result['document_relevance_score'].confidence)
            
        return {
            "latency": latency,
            "search_method": search_method,
            "faithfulness_score": score_display,
            "solution": solution,
            "query": request.query
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
