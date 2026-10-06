from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class DocumentInput(BaseModel):
    content: str = Field(..., description="Document content to be indexed")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Document metadata")
    doc_id: Optional[str] = Field(None, description="Optional document ID")

class QueryInput(BaseModel):
    query: str = Field(..., description="User query")
    top_k: Optional[int] = Field(5, description="Number of documents to retrieve")

class QueryResponse(BaseModel):
    answer: str = Field(..., description="Generated answer")
    sources: List[Dict[str, Any]] = Field(..., description="Source documents")
    metadata: Dict[str, Any] = Field(default={}, description="Additional metadata")

class EvaluationMetrics(BaseModel):
    bert_score: Dict[str, float]
    rouge_scores: Dict[str, float]
    retrieval_accuracy: float

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    vector_store_loaded: bool
    model_loaded: bool
