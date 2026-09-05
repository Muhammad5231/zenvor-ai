import hashlib
from typing import List, Optional
import chromadb
from chromadb.utils import embedding_functions
from app.core.config import settings

class MemoryEngine:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=str(settings.MEMORY_DIR))
        self.embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        self.collection = self.client.get_or_create_collection(
            name="conversation_memory",
            embedding_function=self.embed_fn
        )

    def store_interaction(self, session_id: str, text: str, role: str):
        cleaned = text.strip()
        if len(cleaned) < 15:
            return

        doc_hash = hashlib.sha256(f"{session_id}_{cleaned}".encode("utf-8")).hexdigest()
        self.collection.upsert(
            documents=[cleaned],
            metadatas=[{"session_id": session_id, "role": role}],
            ids=[doc_hash]
        )

    def recall_context(self, query: str, session_id: Optional[str] = None, n_results: int = 3) -> List[str]:
        try:
            count = self.collection.count()
            if count == 0:
                return []
                         
            actual_n = min(n_results, count)
            
            # Session-specific filtering condition
            where_filter = {"session_id": session_id} if session_id else None
            
            results = self.collection.query(
                query_texts=[query],
                n_results=actual_n,
                where=where_filter
            )
            docs = results.get("documents", [[]])[0]
            return [doc for doc in docs if doc]
        except Exception as e:
            print(f"[MemoryEngine] Memory recall failed: {e}")
            return []

memory_engine = MemoryEngine()