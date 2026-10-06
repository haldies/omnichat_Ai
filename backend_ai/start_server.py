"""
Startup script for RAG API Server
Sets environment variables to avoid TensorFlow/Keras conflicts
"""
import os
import sys

# Disable TensorFlow to avoid Keras 3 compatibility issues
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

# Now import and run the main app
if __name__ == "__main__":
    import uvicorn
    from config.settings import settings
    
    print("=" * 60)
    print("Starting Agentic RAG API Server")
    print("=" * 60)
    print(f"Host: {settings.api_host}")
    print(f"Port: {settings.api_port}")
    print(f"Groq Model: {settings.groq_model}")
    print(f"Voyage Model: {settings.voyage_model}")
    print(f"Qdrant Collection: {settings.qdrant_collection_name}")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )
