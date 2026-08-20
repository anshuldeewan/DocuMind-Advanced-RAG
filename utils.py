"""
Utility functions for the Advanced RAG application
"""
import shutil
import os

from config import CHROMA_PERSIST_DIR, CHROMA_COLLECTION_NAME


def clear_chroma_db():
    """Clear ChromaDB data directory for fresh start"""
    if os.path.exists(CHROMA_PERSIST_DIR):
        try:
            import chromadb
            client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
            try:
                client.delete_collection(name=CHROMA_COLLECTION_NAME)
                print(f"Collection {CHROMA_COLLECTION_NAME} deleted via API.")
            except ValueError:
                pass # Collection doesn't exist
        except Exception as e:
            print(f"Warning: could not delete collection via API: {e}")
            
        print("Cleared existing ChromaDB data via API for fresh start")





def get_file_key(uploaded_file):
    """Generate unique key for uploaded file"""
    if uploaded_file is None:
        return None
    return f"{uploaded_file.name}_{uploaded_file.size}"


def format_file_size(size_bytes):
    """Format file size in human-readable format"""
    if size_bytes >= 1024 * 1024:
        size_mb = size_bytes / (1024 * 1024)
        return f"{size_mb:.2f} MB"
    elif size_bytes >= 1024:
        size_kb = size_bytes / 1024
        return f"{size_kb:.1f} KB"
    else:
        return f"{size_bytes} bytes"
