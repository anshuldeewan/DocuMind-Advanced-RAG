"""
Document processing module for the Advanced RAG application
"""
import streamlit as st
import time
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
from dotenv import load_dotenv

load_dotenv()

from config import CHUNK_SIZE, CHUNK_OVERLAP, CHROMA_COLLECTION_NAME, CHROMA_PERSIST_DIR
from utils import get_file_key
from ui_components import render_file_analysis
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
    
    def process_file(self, user_file):
        """
        Processes an uploaded file and creates embeddings
        Returns retriever or None if processing fails
        """
        if user_file is None:
            return None
        
        # Check if file already processed
        current_file_key = get_file_key(user_file)
        if st.session_state.get('processed_file') == current_file_key:
            return st.session_state.get('retriever')
        
        try:
            return self._process_new_file(user_file, current_file_key)
        except Exception as e:
            st.error(f"❌ Error processing file: {str(e)}")
            st.info("💡 Please make sure your file is in a supported format and try again.")
            return None
    
    def _process_new_file(self, user_file, current_file_key):
        """Processes a new file that hasn't been processed before"""
        # Get file info and display analysis
        file_info = self.document_loader.get_upload_info(user_file)
        render_file_analysis(file_info)
        
        # Check if file type is supported
        if not file_info['is_supported']:
            st.error(f"❌ Unsupported file type: .{file_info['extension']}")
            st.info(f"📋 Supported formats: {self.document_loader.get_supported_extensions_display()}")
            return None
        
        # Process the file
        return self._execute_processing_pipeline(user_file, file_info, current_file_key)
    
    def _execute_processing_pipeline(self, user_file, file_info, current_file_key):
        """Runs the complete processing pipeline"""
        st.markdown("### 🔄 Processing Status")
        
        # Initialize progress tracking
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        try:
            # Step 1: Load document
            status_text.text("🔄 Loading document...")
            progress_bar.progress(25)
            documents = self.document_loader.load_uploaded_file(user_file)
            
            # Step 2: Extract content
            status_text.text("🔍 Extracting content...")
            progress_bar.progress(50)
            st.success(f"✅ Successfully extracted content from {file_info['filename']}")
            
            # Step 3: Split into chunks
            progress_bar.progress(75)
            status_text.text("✂️ Splitting into chunks...")
            doc_splits = self._create_document_chunks(documents)
            
            # Step 4: Create embeddings
            progress_bar.progress(90)
            status_text.text("🧠 Creating embeddings...")
            chroma_db = self._create_vector_database(doc_splits)
            
            # Step 5: Complete
            progress_bar.progress(100)
            status_text.text("✅ Processing complete!")
            
            # Clean up UI
            time.sleep(1)
            progress_bar.empty()
            status_text.empty()
            
            # Store in session state
            retriever = chroma_db.as_retriever()
            st.session_state.processed_file = current_file_key
            st.session_state.retriever = retriever
            
            # Debug: Confirm retriever creation and test it
            print(f"Retriever created successfully: {retriever is not None}")
            print(f"Session state updated with file key: {current_file_key}")
            
            # Test the retriever with a simple query
            try:
                test_docs = retriever.invoke("test")
                print(f"Retriever test successful - found {len(test_docs)} documents")
            except Exception as test_error:
                print(f"Retriever test failed: {test_error}")
            
            return retriever
            
        except Exception as e:
            progress_bar.empty()
            status_text.empty()
            raise e
    
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
            chunk_size=500,
            chunk_overlap=100,
            separators=["\n\n", "\n", ". ", " ", ""],
            length_function=len,
        )
        doc_splits = splitter.split_documents(documents)
        
        # Enrich metadata
        for i, split in enumerate(doc_splits):
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
