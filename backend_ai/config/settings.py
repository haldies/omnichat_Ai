from pydantic_settings import BaseSettings
from typing import Optional
import os

# IMPORTANT: Clear any system environment variables that might override .env file
# This prevents conflicts when system env vars are set
if 'GROQ_API_KEY' in os.environ:
    # Check if it's the dummy value
    if os.environ['GROQ_API_KEY'] == 'your_actual_groq_api_key':
        print("⚠️  Removing dummy GROQ_API_KEY from system environment")
        del os.environ['GROQ_API_KEY']

class Settings(BaseSettings):
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_reload: bool = True
    
    # Groq Configuration
    groq_api_key: str
    groq_model: str = "llama-3.1-8b-instant"
    
    # Qdrant Configuration
    qdrant_url: str
    qdrant_api_key: str
    qdrant_collection_name: str = "rag_documents"
    
    # Voyage AI Configuration
    voyage_api_key: str
    voyage_model: str = "voyage-3-large"
    
    # Text Splitting
    chunk_size: int = 1000
    chunk_overlap: int = 200
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        # Pydantic will automatically look for .env file in current directory
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = False
        extra = 'ignore'

# Load settings
settings = Settings()

# Validate that we got the real API key, not the dummy one
if settings.groq_api_key == 'your_actual_groq_api_key':
    raise ValueError(
        "❌ GROQ_API_KEY is still set to dummy value 'your_actual_groq_api_key'!\n"
        "Please check your .env file or system environment variables."
    )

print(f"✅ Settings loaded from .env file")
print(f"✅ Groq API Key loaded: {settings.groq_api_key[:20]}...{settings.groq_api_key[-10:]}")
