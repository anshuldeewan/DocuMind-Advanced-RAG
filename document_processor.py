"""
Document processing module for the Advanced RAG application
"""

import time
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
from dotenv import load_dotenv

load_dotenv()

from config import CHUNK_SIZE, CHUNK_OVERLAP, CHROMA_COLLECTION_NAME, CHROMA_PERSIST_DIR
from utils import get_file_key

import logging

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Processes documents and creates embeddings for the vector database"""
    
    def __init__(self, document_loader):
        self.document_loader = document_loader
        gemini_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        self.embedding_function = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=gemini_key
        )
    
    def process_file_api(self, file_path: str, original_filename: str):
        """
        API-compatible processing pipeline that bypasses Streamlit UI components.
        
        Args:
            file_path: Absolute path to the saved temporary file.
            original_filename: The original name of the uploaded file.
            
        Returns:
            int: Number of chunks created and indexed.
        """
        # Step 1: Load document
        logger.info(f"Loading document for API processing: {original_filename}")
        documents = self.document_loader.load_document(file_path)
        
        for doc in documents:
            doc.metadata["original_filename"] = original_filename
            doc.metadata["processed_via"] = "api"
            
        if not documents:
            raise ValueError(f"No text could be extracted from {original_filename}")
            
        # Step 2: Split into chunks
        logger.info("Splitting into chunks...")
        doc_splits = self._create_document_chunks(documents)
        
        # Step 3: Create embeddings and store in ChromaDB
        logger.info("Creating embeddings...")
        chroma_db = self._create_vector_database(doc_splits)
        
        # Step 4: Validate retriever
        retriever = chroma_db.as_retriever()
        try:
            retriever.invoke("test")
            logger.info("Retriever test successful")
        except Exception as test_error:
            logger.warning(f"Retriever test failed: {test_error}")
            
        return len(doc_splits)

    def _create_document_chunks(self, documents):
        """Splits documents into smaller chunks using recursive character splitting"""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=80,
            separators=["\n\n", "\n", "• ", "- ", ". ", " "],
            length_function=len,
            strip_whitespace=True,
        )
        doc_splits = splitter.split_documents(documents)
        
        # Clean and enrich metadata
        for i, split in enumerate(doc_splits):
            split.page_content = split.page_content.strip()
            split.metadata.update({
                "chunk_id": i,
                "total_chunks": len(doc_splits),
                "chunk_size": len(split.page_content)
            })
        
        return doc_splits
    
    def _create_vector_database(self, doc_splits):
        """Creates a ChromaDB vector database from document chunks"""
        return Chroma.from_documents(
            documents=doc_splits, 
            collection_name=CHROMA_COLLECTION_NAME, 
            embedding=self.embedding_function,
            persist_directory=CHROMA_PERSIST_DIR
        )
