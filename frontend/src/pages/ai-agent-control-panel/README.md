# AI Agent RAG Builder

Panel untuk membuat dan mengelola AI Agent dengan Retrieval-Augmented Generation (RAG).

## Fitur Utama

### 1. RAG Stats Dashboard
Menampilkan statistik real-time dari sistem RAG:
- **Vector Store**: Jumlah dokumen yang terindeks
- **Embedding Model**: Model dan dimensi embedding yang digunakan
- **LLM Provider**: Provider dan model LLM
- **Status**: Status operasional sistem RAG

### 2. Query Tester
Tool untuk menguji query RAG dengan dua mode:
- **Standard RAG**: Query biasa dengan retrieval + generation
- **Agentic RAG**: Query dengan self-reflection dan iterative refinement

Fitur:
- Input query dengan textarea
- Menampilkan jawaban dari LLM
- Menampilkan sumber dokumen dengan relevance score
- Metadata query (iterations, num_sources, dll)

### 3. Document Uploader
Upload dokumen PDF ke vector store:
- Drag & drop atau click to upload
- Support metadata JSON (opsional)
- Menampilkan status upload (success/error)
- Info chunks created dan pages processed

### 4. Vector Store Manager
Manajemen vector store:
- Info collection (total vectors, name, status)
- Clear collection (dengan konfirmasi)
- Danger zone untuk operasi destructive

### 5. Agent Config Panel
Menampilkan konfigurasi agent:
- **LLM Settings**: Provider, model, temperature
- **Embedding Settings**: Provider, model, dimension
- **Text Splitting**: Chunk size, chunk overlap

## API Endpoints

Backend RAG menggunakan endpoint berikut:

### Stats
```
GET http://localhost:8000/stats
```

### Upload PDF
```
POST http://localhost:8000/documents/upload-pdf
Content-Type: multipart/form-data
Body: file (PDF), metadata (JSON string, optional)
```

### Query (Standard)
```
POST http://localhost:8000/query
Content-Type: application/json
Body: {
  "query": "string",
  "top_k": 5
}
```

### Query (Agentic)
```
POST http://localhost:8000/query/agentic
Content-Type: application/json
Body: {
  "query": "string",
  "top_k": 5
}
```

### Clear Collection
```
DELETE http://localhost:8000/collection/clear
```

## Komponen

### QueryTester.jsx
- State: query, queryType, loading, result
- Fungsi: handleQuery()
- UI: Textarea, button, result display

### DocumentUploader.jsx
- State: selectedFile, uploading, uploadStatus, metadata
- Fungsi: handleFileSelect(), handleUpload()
- UI: File input, metadata textarea, upload button

### RAGStatsCard.jsx
- Props: title, value, subtitle, icon, iconColor
- UI: Card dengan icon dan stats

### VectorStoreManager.jsx
- State: showConfirm, clearing
- Fungsi: handleClear()
- UI: Collection info, clear button dengan konfirmasi

### AgentConfigPanel.jsx
- Props: ragStats
- UI: Display konfigurasi LLM, embedding, text splitting

## Setup

1. Pastikan backend RAG berjalan di `http://localhost:8000`
2. Backend harus memiliki endpoint yang sesuai
3. CORS harus diaktifkan di backend untuk frontend

## Environment Variables

Backend menggunakan environment variables di `backend_ai/.env`:
- `GROQ_API_KEY`: API key untuk Groq LLM
- `VOYAGE_API_KEY`: API key untuk Voyage AI embedding
- `QDRANT_URL`: URL Qdrant vector store
- `GROQ_MODEL`: Model LLM (default: mixtral-8x7b-32768)
- `VOYAGE_MODEL`: Model embedding (default: voyage-2)
- `CHUNK_SIZE`: Ukuran chunk (default: 1000)
- `CHUNK_OVERLAP`: Overlap chunk (default: 200)

## Cara Penggunaan

1. **Upload Dokumen**
   - Klik "Upload Dokumen" atau drag & drop PDF
   - Tambahkan metadata jika perlu (format JSON)
   - Klik "Upload Dokumen"

2. **Test Query**
   - Pilih tipe query (Standard atau Agentic)
   - Masukkan pertanyaan
   - Klik "Kirim Query"
   - Lihat jawaban dan sumber dokumen

3. **Monitor Stats**
   - Lihat jumlah dokumen terindeks
   - Cek konfigurasi embedding dan LLM
   - Monitor status sistem

4. **Manage Vector Store**
   - Lihat info collection
   - Clear collection jika perlu (hati-hati!)

## Tips

- Gunakan **Standard RAG** untuk query cepat
- Gunakan **Agentic RAG** untuk query kompleks yang membutuhkan reasoning
- Upload dokumen dengan metadata untuk filtering lebih baik
- Monitor jumlah vectors untuk memastikan dokumen terindeks
- Chunk size dan overlap dapat diatur di backend untuk optimasi
