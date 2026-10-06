"""
FastAPI Main Application
Agentic RAG System with LangChain and Groq
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn

from config.settings import settings
from api.routes import router

# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Agentic RAG API",
    description="RAG system with LangChain, Groq, Qdrant, and Voyage AI",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1", tags=["RAG"])

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("Starting Agentic RAG API...")
    logger.info(f"Groq Model: {settings.groq_model}")
    logger.info(f"Voyage Model: {settings.voyage_model}")
    logger.info(f"Qdrant Collection: {settings.qdrant_collection_name}")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("Shutting down Agentic RAG API...")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Agentic RAG API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )
