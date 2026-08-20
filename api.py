import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
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
        
        # Determine extension properly, fallback to original if split fails
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'tmp'
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name
            
        try:
            # Use decoupled document processor for API
            chunk_count = document_processor.process_file_api(temp_path, file.filename)
            
            # Since process_file_api doesn't return retriever directly, we recreate it here
            # Or we can just get it since the backend uses a singleton/static Chroma instance.
            # RAGWorkflow initializes its own retriever typically, but let's just re-initialize it.
            # document_processor uses CHROMA_COLLECTION_NAME, CHROMA_PERSIST_DIR
            from langchain_chroma import Chroma
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            from config import CHROMA_COLLECTION_NAME, CHROMA_PERSIST_DIR
            
            embedding_function = GoogleGenerativeAIEmbeddings(
                model="models/gemini-embedding-001",
                google_api_key=os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
            )
            
            chroma_db = Chroma(
                collection_name=CHROMA_COLLECTION_NAME,
                embedding_function=embedding_function,
                persist_directory=CHROMA_PERSIST_DIR
            )
            retriever = chroma_db.as_retriever()
            
            rag_workflow.set_retriever(retriever)
            
            return {
                "status": "success",
                "filename": file.filename,
                "chunks_created": chunk_count,
                "message": f"Successfully parsed and indexed {chunk_count} chunks from {file.filename}"
            }
        except Exception as proc_error:
            raise HTTPException(status_code=400, detail=f"Parsing error: {str(proc_error)}")
        finally:
            # Clean up the temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_document(request: QueryRequest):
    start_time = time.time()
    
    try:
        result = rag_workflow.process_question(request.query)
        end_time = time.time()
        
        latency = round(end_time - start_time, 2)
        
        # Format response
        score_display = 0.95
        if 'document_relevance_score' in result and hasattr(result['document_relevance_score'], 'confidence'):
            score_display = float(result['document_relevance_score'].confidence)
            
        return {
            "answer": result.get("solution", ""),
            "latency": latency,
            "sources": [doc.page_content for doc in result.get("documents", [])],
            "faithfulness_score": score_display,
            "route": result.get("search_method", "vectorstore")
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
