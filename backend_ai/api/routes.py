"""
FastAPI Routes for RAG System
"""
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Header
from typing import List, Optional
import logging
from datetime import datetime
import tempfile
import os

from models.schemas import (
    DocumentInput,
    QueryInput,
    QueryResponse,
    HealthResponse,
    EvaluationMetrics
)
from services.rag_service import rag_service
from services.evaluation_service import evaluation_service
from services.qdrant_service import qdrant_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        vector_store_loaded=True,  # Qdrant is always available
        model_loaded=rag_service.llm is not None
    )

@router.get("/stats")
async def get_stats(business_id: str = Header(None, alias="X-Business-ID")):
    """Get RAG system statistics"""
    try:
        if not business_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Business-ID header is required"
            )
        
        stats = rag_service.get_stats(business_id=business_id)
        return {
            "status": "success",
            "stats": stats
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/documents/add")
async def add_documents(documents: List[DocumentInput], business_id: str = Header(None, alias="X-Business-ID")):
    """
    Add documents to the vector store
    """
    try:
        if not business_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Business-ID header is required"
            )
        
        docs = [doc.dict() for doc in documents]
        result = await rag_service.add_documents(docs, business_id=business_id)
        
        if result.get("success"):
            return {
                "status": "success",
                "message": result.get("message"),
                "documents_processed": result.get("documents_processed"),
                "chunks_created": result.get("chunks_created")
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("message", "Failed to add documents")
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/documents/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    metadata: Optional[str] = Form(default=None),
    business_id: str = Header(None, alias="X-Business-ID")
):
    """
    Upload and process PDF file
    """
    try:
        if not business_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Business-ID header is required"
            )
        
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are allowed"
            )
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Process PDF
            import json
            metadata_dict = {}
            
            # Parse metadata if provided and not empty
            if metadata and metadata.strip():
                try:
                    metadata_dict = json.loads(metadata)
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON metadata: {metadata}")
                    # Continue with empty metadata instead of failing
            
            metadata_dict['filename'] = file.filename
            
            result = await rag_service.process_pdf(tmp_file_path, metadata_dict, business_id=business_id)
            
            return {
                "status": "success",
                "message": f"PDF processed successfully",
                "filename": file.filename,
                "chunks_created": result.get("chunks_created", 0),
                "doc_id": result.get("doc_id"),
                "pages_processed": result.get("pages_processed", 0)
            }
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading PDF: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )



@router.post("/query", response_model=QueryResponse)
async def query_rag(query_input: QueryInput, business_id: str = Header(None, alias="X-Business-ID")):
    """
    Query the RAG system
    """
    try:
        if not business_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Business-ID header is required"
            )
        
        result = await rag_service.query(
            query=query_input.query,
            top_k=query_input.top_k,
            business_id=business_id
        )
        
        return QueryResponse(
            answer=result["answer"],
            sources=result["sources"],
            metadata=result["metadata"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/search")
async def search_documents(query_input: QueryInput, business_id: str = Header(None, alias="X-Business-ID")):
    """
    Search documents without LLM generation (embedding-only search)
    Returns relevant document chunks based on semantic similarity
    """
    try:
        if not business_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Business-ID header is required"
            )
        
        # Direct search without LLM
        search_results = qdrant_service.search(
            query=query_input.query,
            top_k=query_input.top_k,
            business_id=business_id
        )
        
        if not search_results:
            return {
                "query": query_input.query,
                "results": [],
                "count": 0,
                "message": "No relevant documents found"
            }
        
        return {
            "query": query_input.query,
            "results": search_results,
            "count": len(search_results),
            "message": f"Found {len(search_results)} relevant documents"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/query/agentic", response_model=QueryResponse)
async def agentic_query(query_input: QueryInput, business_id: str = Header(None, alias="X-Business-ID")):
    """
    Agentic query with self-reflection
    """
    try:
        if not business_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Business-ID header is required"
            )
        
        result = await rag_service.agentic_query(
            query_input.query,
            business_id=business_id
        )
        
        return QueryResponse(
            answer=result["answer"],
            sources=result["sources"],
            metadata=result["metadata"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in agentic query: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/evaluate")
async def evaluate_response(
    prediction: str,
    reference: str,
    retrieved_docs: List[dict],
    relevant_doc_ids: List[str] = None
):
    """
    Evaluate RAG response quality
    """
    try:
        evaluation = evaluation_service.evaluate_rag_response(
            prediction=prediction,
            reference=reference,
            retrieved_docs=retrieved_docs,
            relevant_doc_ids=relevant_doc_ids
        )
        
        return {
            "status": "success",
            "evaluation": evaluation
        }
    except Exception as e:
        logger.error(f"Error evaluating response: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )




@router.get("/collection/info")
async def get_collection_info(business_id: str = Header(None, alias="X-Business-ID")):
    """
    Get Qdrant collection information
    """
    try:
        if not business_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Business-ID header is required"
            )
        
        info = qdrant_service.get_collection_info(business_id=business_id)
        return {
            "status": "success",
            "collection": info
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting collection info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/collection/clear")
async def clear_collection(business_id: str = Header(None, alias="X-Business-ID")):
    """
    Clear all documents from collection
    """
    try:
        if not business_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Business-ID header is required"
            )
        
        success = qdrant_service.clear_collection(business_id=business_id)
        if success:
            return {
                "status": "success",
                "message": "Collection cleared successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to clear collection"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing collection: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/documents/delete")
async def delete_documents(doc_ids: List[str], business_id: str = Header(None, alias="X-Business-ID")):
    """
    Delete specific documents by IDs
    """
    try:
        if not business_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Business-ID header is required"
            )
        
        success = qdrant_service.delete_documents(doc_ids, business_id=business_id)
        if success:
            return {
                "status": "success",
                "message": f"Deleted {len(doc_ids)} documents",
                "deleted_ids": doc_ids
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete documents"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
