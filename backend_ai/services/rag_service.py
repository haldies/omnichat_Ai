"""
Agentic RAG Service using LangChain, Groq, Qdrant, and Voyage AI
"""
import os
# Set environment variables BEFORE any imports
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser

from langchain_text_splitters.character import RecursiveCharacterTextSplitter
import logging
from typing import List, Dict, Any, Optional, Generator
import asyncio
import uuid

from config.settings import settings
from services.qdrant_service import qdrant_service
from services.embedding_service import voyage_embedding_service

logger = logging.getLogger(__name__)

class AgenticRAGService:
    def __init__(self):
        self.llm = None
        self.text_splitter = None
        self._initialize()
    
    def _initialize(self):
        """Initialize all components"""
        try:
            # Initialize LLM with better configuration
            self.llm = ChatGroq(
                groq_api_key=settings.groq_api_key,
                model_name=settings.groq_model,
                temperature=0.7,
                max_tokens=2048,  # Reasonable default
                timeout=30.0,  # 30 second timeout
                max_retries=2  # Retry on failure
            )
            logger.info(f"Initialized Groq LLM with model: {settings.groq_model}")
            
            # Initialize text splitter with better defaults
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=settings.chunk_size,
                chunk_overlap=settings.chunk_overlap,
                length_function=len,
                separators=["\n\n", "\n", ". ", " ", ""]  # Better splitting
            )
            logger.info("Initialized text splitter")
            
        except Exception as e:
            logger.error(f"Error initializing RAG service: {e}", exc_info=True)
            raise
    
    async def add_documents(self, documents: List[Dict[str, Any]], business_id: str = None) -> Dict[str, Any]:
        """
        Add documents to Qdrant vector store with better error handling
        Returns detailed results including success/failure counts
        """
        try:
            if not business_id:
                return {
                    "success": False,
                    "message": "business_id is required",
                    "documents_processed": 0,
                    "chunks_created": 0
                }
            
            all_texts = []
            all_metadatas = []
            all_ids = []
            doc_chunk_map = {}  # Track which chunks belong to which document
            
            for doc_idx, doc in enumerate(documents):
                content = doc.get("content", "")
                if not content:
                    logger.warning(f"Document {doc_idx} has no content, skipping")
                    continue
                
                metadata = doc.get("metadata", {})
                doc_id = doc.get("doc_id", f"doc_{doc_idx}")
                
                # Split document into chunks
                chunks = self.text_splitter.split_text(content)
                
                if not chunks:
                    logger.warning(f"Document {doc_id} produced no chunks")
                    continue
                
                doc_chunk_map[doc_id] = len(chunks)
                
                for i, chunk in enumerate(chunks):
                    all_texts.append(chunk)
                    
                    # Add chunk metadata with better structure
                    chunk_metadata = metadata.copy()
                    chunk_metadata.update({
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                        "doc_id": doc_id,
                        "chunk_size": len(chunk)
                    })
                    all_metadatas.append(chunk_metadata)
                    
                    # Generate unique UUID for each chunk (Qdrant requires UUID or int)
                    chunk_id = str(uuid.uuid4())
                    all_ids.append(chunk_id)
            
            if not all_texts:
                return {
                    "success": False,
                    "message": "No valid documents to add",
                    "documents_processed": 0,
                    "chunks_created": 0
                }
            
            logger.info(f"Split {len(documents)} documents into {len(all_texts)} chunks for business {business_id}")
            
            # Add to Qdrant with business_id
            success = qdrant_service.add_documents(
                texts=all_texts,
                metadatas=all_metadatas,
                ids=all_ids,
                business_id=business_id
            )
            
            return {
                "success": success,
                "message": f"Successfully added {len(all_texts)} chunks from {len(doc_chunk_map)} documents" if success else "Failed to add documents",
                "documents_processed": len(doc_chunk_map),
                "chunks_created": len(all_texts),
                "chunk_distribution": doc_chunk_map
            }
            
        except Exception as e:
            logger.error(f"Error adding documents: {e}", exc_info=True)
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "documents_processed": 0,
                "chunks_created": 0
            }
    
    async def process_pdf(self, pdf_path: str, metadata: Dict[str, Any] = None, business_id: str = None) -> Dict[str, Any]:
        """
        Process PDF file and add to vector store
        """
        try:
            # Import PDF library
            try:
                from pypdf import PdfReader
            except ImportError:
                try:
                    from PyPDF2 import PdfReader
                except ImportError:
                    raise ImportError("Please install pypdf or PyPDF2: pip install pypdf")
            
            # Read PDF
            reader = PdfReader(pdf_path)
            
            # Extract text from all pages
            full_text = ""
            page_texts = []
            
            for page_num, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    page_texts.append({
                        "page_num": page_num + 1,
                        "text": page_text
                    })
                    full_text += f"\n\n--- Page {page_num + 1} ---\n\n{page_text}"
            
            if not full_text.strip():
                return {
                    "success": False,
                    "message": "No text could be extracted from PDF",
                    "chunks_created": 0
                }
            
            # Generate document ID
            doc_id = metadata.get("doc_id") or str(uuid.uuid4())
            
            # Prepare metadata
            if metadata is None:
                metadata = {}
            
            metadata.update({
                "source": "pdf",
                "total_pages": len(reader.pages),
                "doc_id": doc_id
            })
            
            # Add document using existing add_documents method
            result = await self.add_documents([{
                "content": full_text,
                "metadata": metadata,
                "doc_id": doc_id
            }], business_id=business_id)
            
            return {
                "success": result.get("success", False),
                "message": result.get("message", ""),
                "chunks_created": result.get("chunks_created", 0),
                "doc_id": doc_id,
                "pages_processed": len(page_texts)
            }
            
        except Exception as e:
            logger.error(f"Error processing PDF: {e}", exc_info=True)
            return {
                "success": False,
                "message": f"Error processing PDF: {str(e)}",
                "chunks_created": 0
            }
    

    
    async def query(
        self,
        query: str,
        top_k: int = 5,
        filter_conditions: Optional[Dict[str, Any]] = None,
        stream: bool = False,
        business_id: str = None
    ) -> Dict[str, Any]:
        """
        Query the RAG system with optional streaming
        """
        try:
            if not business_id:
                return {
                    "answer": "business_id is required",
                    "sources": [],
                    "metadata": {"error": "missing_business_id"}
                }
            
            # Search for relevant documents
            search_results = qdrant_service.search(
                query=query,
                top_k=top_k,
                filter_conditions=filter_conditions,
                business_id=business_id
            )
            
            if not search_results:
                return {
                    "answer": "No relevant documents found in the knowledge base.",
                    "sources": [],
                    "metadata": {"error": "no_results"}
                }
            
            # Build context from search results with source attribution
            context_parts = []
            for i, result in enumerate(search_results):
                source_info = f"Source {i+1}"
                if result['metadata']:
                    source_info += f" ({', '.join(f'{k}: {v}' for k, v in result['metadata'].items())})"
                context_parts.append(f"{source_info}:\n{result['text']}")
            
            context = "\n\n".join(context_parts)
            
            # Create prompt with better structure
            system_message = SystemMessage(content="""You are an intelligent AI assistant with access to a knowledge base.
Use the provided context to answer questions accurately and concisely.
If the context doesn't contain enough information, acknowledge this limitation.
Always cite which source(s) you're using in your answer.""")
            
            user_message = HumanMessage(content=f"""Context:
{context}

Question: {query}

Please provide a clear answer based on the context above.""")
            
            messages = [system_message, user_message]
            
            # Generate answer (sync invoke, not async)
            if stream:
                # Return generator for streaming
                return self._stream_response(messages, search_results, query)
            else:
                response = self.llm.invoke(messages)
                answer = response.content
            
            # Format sources
            sources = []
            for result in search_results:
                sources.append({
                    "content": result["text"],
                    "score": result["score"],
                    "metadata": result["metadata"]
                })
            
            return {
                "answer": answer,
                "sources": sources,
                "metadata": {
                    "query": query,
                    "num_sources": len(sources),
                    "top_score": search_results[0]["score"] if search_results else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error during query: {e}", exc_info=True)
            return {
                "answer": f"Error processing query: {str(e)}",
                "sources": [],
                "metadata": {"error": str(e)}
            }
    
    def _stream_response(self, messages: List, search_results: List, query: str):
        """
        Stream response from LLM
        """
        try:
            sources = [
                {
                    "content": result["text"],
                    "score": result["score"],
                    "metadata": result["metadata"]
                }
                for result in search_results
            ]
            
            # Stream tokens
            for chunk in self.llm.stream(messages):
                if chunk.content:
                    yield {
                        "type": "token",
                        "content": chunk.content
                    }
            
            # Send sources at the end
            yield {
                "type": "complete",
                "sources": sources,
                "metadata": {
                    "query": query,
                    "num_sources": len(sources),
                    "top_score": search_results[0]["score"] if search_results else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error streaming response: {e}", exc_info=True)
            yield {
                "type": "error",
                "error": str(e)
            }
    
    async def agentic_query(
        self,
        query: str,
        max_iterations: int = 3,
        top_k: int = 5,
        business_id: str = None
    ) -> Dict[str, Any]:
        """
        Agentic query with self-reflection and iterative refinement
        Uses a more efficient approach with better context management
        """
        try:
            if not business_id:
                return {
                    "answer": "business_id is required",
                    "sources": [],
                    "metadata": {"error": "missing_business_id"}
                }
            
            conversation_history = []
            all_retrieved_docs = []
            iteration_count = 0
            
            for iteration in range(max_iterations):
                iteration_count += 1
                logger.info(f"Agentic iteration {iteration_count}/{max_iterations}")
                
                # Search for relevant documents
                search_results = qdrant_service.search(
                    query=query,
                    top_k=top_k,
                    business_id=business_id
                )
                
                if not search_results:
                    break
                
                # Track all retrieved documents
                all_retrieved_docs.extend(search_results)
                
                # Build context from current search results
                context = "\n\n".join([
                    f"Source {i+1} (relevance: {result['score']:.3f}):\n{result['text']}"
                    for i, result in enumerate(search_results)
                ])
                
                # Build messages with conversation history
                messages = [
                    SystemMessage(content="""You are an expert AI assistant. 
Analyze the provided context carefully and answer the question thoroughly.
If you need more information, indicate what's missing.
If you have enough information, provide a complete answer.""")
                ]
                
                # Add conversation history
                for msg in conversation_history:
                    messages.append(msg)
                
                # Add current query with context
                messages.append(HumanMessage(content=f"""Context:
{context}

Question: {query}

Provide your answer:"""))
                
                # Generate answer (sync invoke)
                response = self.llm.invoke(messages)
                answer = response.content
                
                # Add to conversation history
                conversation_history.append(HumanMessage(content=f"Question: {query}"))
                conversation_history.append(AIMessage(content=answer))
                
                # Self-reflection with better prompt
                reflection_messages = [
                    SystemMessage(content="You are a critical evaluator. Assess if the answer is complete, accurate, and addresses all aspects of the question."),
                    HumanMessage(content=f"""Question: {query}

Answer: {answer}

Is this answer complete and satisfactory? 
Consider:
- Does it fully address the question?
- Is it accurate based on the context?
- Is any critical information missing?

Respond with ONLY 'COMPLETE' or 'INCOMPLETE'.
If incomplete, briefly state what's missing.""")
                ]
                
                reflection = self.llm.invoke(reflection_messages)
                reflection_text = reflection.content.strip().upper()
                
                logger.info(f"Reflection result: {reflection_text}")
                
                if "COMPLETE" in reflection_text:
                    logger.info(f"Answer satisfactory at iteration {iteration_count}")
                    break
                
                # If incomplete, prepare for next iteration
                if iteration < max_iterations - 1:
                    conversation_history.append(
                        SystemMessage(content=f"Reflection: {reflection.content}. Let's refine the answer.")
                    )
            
            # Deduplicate sources by ID
            seen_ids = set()
            unique_sources = []
            for doc in all_retrieved_docs:
                doc_id = doc.get("id")
                if doc_id not in seen_ids:
                    seen_ids.add(doc_id)
                    unique_sources.append({
                        "content": doc["text"],
                        "score": doc["score"],
                        "metadata": doc["metadata"]
                    })
            
            return {
                "answer": answer,
                "sources": unique_sources,
                "metadata": {
                    "query": query,
                    "iterations": iteration_count,
                    "num_sources": len(unique_sources),
                    "top_score": unique_sources[0]["score"] if unique_sources else 0,
                    "conversation_history": [
                        {"role": msg.__class__.__name__, "content": msg.content}
                        for msg in conversation_history
                    ]
                }
            }
            
        except Exception as e:
            logger.error(f"Error in agentic query: {e}", exc_info=True)
            return {
                "answer": f"Error in agentic processing: {str(e)}",
                "sources": [],
                "metadata": {"error": str(e)}
            }
    
    def get_stats(self, business_id: str = None) -> Dict[str, Any]:
        """Get comprehensive RAG system statistics"""
        try:
            if not business_id:
                return {
                    "status": "error",
                    "error": "business_id is required"
                }
            
            collection_info = qdrant_service.get_collection_info(business_id=business_id)
            
            return {
                "status": "operational",
                "vector_store": {
                    "type": "qdrant",
                    "url": settings.qdrant_url,
                    "collection": collection_info
                },
                "embedding": {
                    "provider": "voyage_ai",
                    "model": settings.voyage_model,
                    "dimension": voyage_embedding_service.get_embedding_dimension()
                },
                "llm": {
                    "provider": "groq",
                    "model": settings.groq_model,
                    "temperature": 0.7
                },
                "text_splitting": {
                    "chunk_size": settings.chunk_size,
                    "chunk_overlap": settings.chunk_overlap
                }
            }
        except Exception as e:
            logger.error(f"Error getting stats: {e}", exc_info=True)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def batch_query(
        self,
        queries: List[str],
        top_k: int = 5,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Process multiple queries in batch
        More efficient than calling query() multiple times
        """
        try:
            results = []
            
            for query in queries:
                result = await self.query(
                    query=query,
                    top_k=top_k,
                    filter_conditions=filter_conditions
                )
                results.append(result)
            
            return results
            
        except Exception as e:
            logger.error(f"Error in batch query: {e}", exc_info=True)
            return [
                {
                    "answer": f"Error processing batch: {str(e)}",
                    "sources": [],
                    "metadata": {"error": str(e)}
                }
                for _ in queries
            ]

# Global instance
rag_service = AgenticRAGService()
