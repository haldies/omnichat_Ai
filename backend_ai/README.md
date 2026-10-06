# Agentic RAG Backend with FastAPI

> Cara termudah: dari folder root jalankan `docker compose up --build` (lihat `README.md` / `DOCKER.md`).
> Langkah manual di bawah hanya untuk dev tanpa Docker.

Backend FastAPI untuk sistem Agentic RAG menggunakan LangChain, Groq, dan Context7.

## Features

- 🤖 **Agentic RAG**: Self-reflecting RAG system dengan iterasi otomatis
- 🚀 **Groq Integration**: Fast inference menggunakan Groq LLM
- 🗄️ **Qdrant Vector Store**: Cloud-based vector database
- 🌊 **Voyage AI Embeddings**: High-quality embeddings dengan voyage-3-large
- 📊 **Evaluation Metrics**: BERT Score dan ROUGE metrics
- 🎯 **LangChain**: Powerful RAG orchestration

## Tech Stack

- **FastAPI**: Modern web framework
- **LangChain**: RAG orchestration
- **Groq**: LLM inference (Mixtral-8x7b)
- **Qdrant**: Cloud vector database
- **Voyage AI**: Text embeddings (voyage-3-large)
- **BERT Score & ROUGE**: Evaluation metrics

## Installation

1. Install dependencies:
```bash
cd backend_ai
pip install -r requirements.txt
```

2. Setup environment:
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

3. Run the server:
```bash
python main.py
```

Server akan berjalan di `http://localhost:8000`

## API Endpoints

### Health Check
```bash
GET /api/v1/health
```

### Add Documents
```bash
POST /api/v1/documents/add
Content-Type: application/json

[
  {
    "content": "Your document content here",
    "metadata": {"source": "example"}
  }
]
```

### Query RAG System
```bash
POST /api/v1/query
Content-Type: application/json

{
  "query": "How do I use LangChain chains?",
  "top_k": 5
}
```

### Agentic Query (with self-reflection)
```bash
POST /api/v1/query/agentic
Content-Type: application/json

{
  "query": "Explain RAG architecture in detail"
}
```

### Evaluate Response
```bash
POST /api/v1/evaluate
Content-Type: application/json

{
  "prediction": "Generated answer",
  "reference": "Ground truth answer",
  "retrieved_docs": [...],
  "relevant_doc_ids": ["doc1", "doc2"]
}
```

## Architecture

```
backend_ai/
├── main.py                 # FastAPI application
├── config/
│   └── settings.py        # Configuration
├── api/
│   └── routes.py          # API endpoints
├── models/
│   └── schemas.py         # Pydantic models
├── services/
│   ├── rag_service.py     # RAG logic
│   ├── qdrant_service.py  # Qdrant integration
│   ├── embedding_service.py # Voyage AI embeddings
│   └── evaluation_service.py # Metrics
```

## How It Works

### 1. Document Ingestion
- Documents are split into chunks using RecursiveCharacterTextSplitter
- Chunks are embedded using Voyage AI embeddings
- Embeddings are stored in Qdrant cloud vector database

### 2. Retrieval
- User query is embedded using Voyage AI
- Similar documents are retrieved from Qdrant
- Top-k most relevant chunks are selected

### 3. Generation
- Retrieved context + query sent to Groq LLM
- LLM generates answer based on context
- Sources are returned with the answer

### 4. Agentic Loop
- System generates initial answer
- Self-reflects on answer quality
- Iterates if answer needs improvement
- Returns final refined answer

## Configuration

### BERT Score
- Measures semantic similarity
- Returns precision, recall, F1

### ROUGE Score
- Measures n-gram overlap
- ROUGE-1, ROUGE-2, ROUGE-L

### Retrieval Accuracy
- Measures relevant document retrieval
- Precision@K metric

## Configuration

Edit `.env` file:

```env
# Groq API
GROQ_API_KEY=your_key_here
GROQ_MODEL=mixtral-8x7b-32768

# Qdrant
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
QDRANT_COLLECTION_NAME=rag_documents

# Voyage AI
VOYAGE_API_KEY=your_voyage_key
VOYAGE_MODEL=voyage-3-large

# Text Splitting
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

## Development

### Run with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Access API docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/api/v1/health

# Test query
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is RAG?"}'
```

## Notes

- Qdrant vector store is cloud-based (no local storage needed)
- First query may be slow (model loading)
- Voyage AI provides high-quality embeddings
- Supports filtering by metadata in queries

## License

MIT
