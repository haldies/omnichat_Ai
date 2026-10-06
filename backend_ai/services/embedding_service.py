"""
Voyage AI Embedding Service
"""
import voyageai
import logging
from typing import List
import numpy as np

from config.settings import settings

logger = logging.getLogger(__name__)

class VoyageEmbeddingService:
    def __init__(self):
        self.client = voyageai.Client(api_key=settings.voyage_api_key)
        self.model = settings.voyage_model
        logger.info(f"Initialized Voyage AI with model: {self.model}")
    
    def embed_text(self, text: str) -> List[float]:
        """
        Embed single text
        """
        try:
            result = self.client.embed(
                texts=[text],
                model=self.model
            )
            return result.embeddings[0]
        except Exception as e:
            logger.error(f"Error embedding text: {e}")
            raise
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Embed multiple texts in batch
        """
        try:
            result = self.client.embed(
                texts=texts,
                model=self.model
            )
            return result.embeddings
        except Exception as e:
            logger.error(f"Error embedding texts: {e}")
            raise
    
    def get_embedding_dimension(self) -> int:
        """
        Get embedding dimension for the model
        voyage-3-large has 1024 dimensions
        """
        dimension_map = {
            "voyage-3-large": 1024,
            "voyage-3": 1024,
            "voyage-2": 1024,
            "voyage-large-2": 1536,
        }
        return dimension_map.get(self.model, 1024)

# Global instance
voyage_embedding_service = VoyageEmbeddingService()
