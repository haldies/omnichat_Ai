"""
Qdrant Vector Database Service with Multi-tenancy Support
"""
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)
import logging
from typing import List, Dict, Any, Optional
import uuid

from config.settings import settings
from services.embedding_service import voyage_embedding_service

logger = logging.getLogger(__name__)

class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key,
            timeout=60  # 60 seconds timeout
        )
        self.base_collection_name = settings.qdrant_collection_name
        logger.info(f"Initialized Qdrant client with base collection: {self.base_collection_name}")
    
    def _get_collection_name(self, business_id: str) -> str:
        """
        Get collection name for specific business
        Format: {base_collection_name}_{business_id}
        """
        return f"{self.base_collection_name}_{business_id}"
    
    def _initialize_collection(self, collection_name: str):
        """
        Initialize collection if it doesn't exist
        """
        try:
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if collection_name not in collection_names:
                logger.info(f"Creating collection: {collection_name}")
                
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(
                        size=voyage_embedding_service.get_embedding_dimension(),
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Collection {collection_name} created successfully")
            else:
                logger.info(f"Collection {collection_name} already exists")
                
        except Exception as e:
            logger.error(f"Error initializing collection: {e}")
            raise
    
    def add_documents(
        self,
        texts: List[str],
        metadatas: List[Dict[str, Any]] = None,
        ids: List[str] = None,
        business_id: str = None
    ) -> bool:
        """
        Add documents to Qdrant for specific business
        """
        try:
            if not texts:
                return False
            
            if not business_id:
                raise ValueError("business_id is required for multi-tenancy")
            
            collection_name = self._get_collection_name(business_id)
            self._initialize_collection(collection_name)
            
            # Generate IDs if not provided
            if ids is None:
                ids = [str(uuid.uuid4()) for _ in texts]
            
            # Generate default metadata if not provided
            if metadatas is None:
                metadatas = [{} for _ in texts]
            
            # Add business_id to all metadata
            for metadata in metadatas:
                metadata["business_id"] = business_id
            
            # Embed texts
            logger.info(f"Embedding {len(texts)} documents for business {business_id}...")
            embeddings = voyage_embedding_service.embed_texts(texts)
            
            # Create points
            points = []
            for i, (text, embedding, metadata, doc_id) in enumerate(
                zip(texts, embeddings, metadatas, ids)
            ):
                # Add text to metadata
                metadata["text"] = text
                metadata["doc_id"] = doc_id
                
                point = PointStruct(
                    id=doc_id,
                    vector=embedding,
                    payload=metadata
                )
                points.append(point)
            
            # Upload to Qdrant
            logger.info(f"Uploading {len(points)} points to collection {collection_name}...")
            result = self.client.upsert(
                collection_name=collection_name,
                points=points,
                wait=True  # Wait for operation to complete
            )
            
            logger.info(f"Successfully added {len(points)} documents for business {business_id}")
            logger.info(f"Upsert result: {result}")
            
            # Verify the upload
            try:
                count_result = self.client.count(collection_name=collection_name)
                actual_count = count_result.count if hasattr(count_result, 'count') else 0
                logger.info(f"Collection {collection_name} now has {actual_count} points")
            except Exception as verify_error:
                logger.warning(f"Could not verify count: {verify_error}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding documents: {e}", exc_info=True)
            return False
    
    def search(
        self,
        query: str,
        top_k: int = 5,
        filter_conditions: Optional[Dict[str, Any]] = None,
        business_id: str = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents in business-specific collection
        """
        try:
            if not business_id:
                raise ValueError("business_id is required for multi-tenancy")
            
            collection_name = self._get_collection_name(business_id)
            
            # Check if collection exists
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if collection_name not in collection_names:
                logger.warning(f"Collection {collection_name} does not exist")
                return []
            
            # Embed query
            query_embedding = voyage_embedding_service.embed_text(query)
            
            # Build filter if provided
            query_filter = None
            if filter_conditions:
                conditions = []
                for key, value in filter_conditions.items():
                    conditions.append(
                        FieldCondition(
                            key=key,
                            match=MatchValue(value=value)
                        )
                    )
                query_filter = Filter(must=conditions)
            
            # Search using query method
            results = self.client.query_points(
                collection_name=collection_name,
                query=query_embedding,
                limit=top_k,
                query_filter=query_filter
            )
            
            # Format results
            formatted_results = []
            for result in results.points:
                formatted_results.append({
                    "id": result.id,
                    "score": result.score,
                    "text": result.payload.get("text", ""),
                    "metadata": {
                        k: v for k, v in result.payload.items()
                        if k not in ["text", "doc_id", "business_id"]
                    }
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching documents: {e}", exc_info=True)
            return []
    
    def delete_documents(self, ids: List[str], business_id: str = None) -> bool:
        """
        Delete documents by IDs from business-specific collection
        """
        try:
            if not business_id:
                raise ValueError("business_id is required for multi-tenancy")
            
            collection_name = self._get_collection_name(business_id)
            
            self.client.delete(
                collection_name=collection_name,
                points_selector=ids
            )
            logger.info(f"Deleted {len(ids)} documents from {collection_name}")
            return True
        except Exception as e:
            logger.error(f"Error deleting documents: {e}")
            return False
    
    def get_collection_info(self, business_id: str = None) -> Dict[str, Any]:
        """
        Get collection information for specific business
        """
        try:
            if not business_id:
                raise ValueError("business_id is required for multi-tenancy")
            
            collection_name = self._get_collection_name(business_id)
            
            # Check if collection exists
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if collection_name not in collection_names:
                logger.info(f"Collection {collection_name} does not exist yet")
                return {
                    "collection_name": collection_name,
                    "vectors_count": 0,
                    "points_count": 0,
                    "status": "not_created"
                }
            
            # Get collection info
            info = self.client.get_collection(collection_name)
            
            # Try to get count using scroll method (more reliable)
            try:
                scroll_result = self.client.scroll(
                    collection_name=collection_name,
                    limit=1,
                    with_payload=False,
                    with_vectors=False
                )
                # Get actual count by counting
                count_result = self.client.count(collection_name=collection_name)
                actual_count = count_result.count if hasattr(count_result, 'count') else 0
                
                logger.info(f"Collection {collection_name} has {actual_count} points")
            except Exception as count_error:
                logger.warning(f"Could not get count: {count_error}")
                actual_count = 0
            
            return {
                "collection_name": collection_name,
                "vectors_count": actual_count,
                "points_count": actual_count,
                "status": "active"
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {e}", exc_info=True)
            return {
                "collection_name": f"{self.base_collection_name}_{business_id}",
                "vectors_count": 0,
                "points_count": 0,
                "status": "error"
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {e}")
            return {
                "collection_name": f"{self.base_collection_name}_{business_id}",
                "vectors_count": 0,
                "points_count": 0,
                "status": "error"
            }
    
    def clear_collection(self, business_id: str = None) -> bool:
        """
        Clear all documents from business-specific collection
        """
        try:
            if not business_id:
                raise ValueError("business_id is required for multi-tenancy")
            
            collection_name = self._get_collection_name(business_id)
            
            self.client.delete_collection(collection_name)
            logger.info(f"Cleared collection: {collection_name}")
            return True
        except Exception as e:
            logger.error(f"Error clearing collection: {e}")
            return False

# Global instance
qdrant_service = QdrantService()
