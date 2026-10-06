"""
Clean startup script - removes conflicting environment variables first
"""
import os
import sys

# Remove any existing GROQ_API_KEY from environment
if 'GROQ_API_KEY' in os.environ:
    print(f"⚠️  Removing existing GROQ_API_KEY from environment: {os.environ['GROQ_API_KEY'][:20]}...")
    del os.environ['GROQ_API_KEY']

# Remove other potentially conflicting vars
conflicting_vars = ['VOYAGE_API_KEY', 'QDRANT_API_KEY', 'QDRANT_URL']
for var in conflicting_vars:
    if var in os.environ:
        print(f"⚠️  Removing existing {var} from environment")
        del os.environ[var]

print("✅ Environment cleaned")
print()

# Disable TensorFlow to avoid Keras 3 compatibility issues
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

# Now import and run the main app
if __name__ == "__main__":
    import uvicorn
    from config.settings import settings
    
    print("=" * 60)
    print("Starting Agentic RAG API Server (Clean Mode)")
    print("=" * 60)
    print(f"Host: {settings.api_host}")
    print(f"Port: {settings.api_port}")
    print(f"Groq Model: {settings.groq_model}")
    print(f"Groq API Key: {settings.groq_api_key[:20]}...{settings.groq_api_key[-10:]}")
    print(f"Voyage Model: {settings.voyage_model}")
    print(f"Qdrant Collection: {settings.qdrant_collection_name}")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )
