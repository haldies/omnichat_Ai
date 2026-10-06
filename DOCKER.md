# OmniChat — Install Simple pakai Docker

Ada 3 service: `frontend` (React), `backend` (Node), `backend-ai` (Python RAG).
Cukup 1 perintah dari folder root ini.

## 1. Siapkan env (sekali saja)

```bash
cp backend/.env.example backend/.env
cp backend_ai/.env.example backend_ai/.env
# lalu isi backend/.env (DATABASE_URL, SUPABASE_*) dan backend_ai/.env (GROQ_API_KEY, QDRANT_*, VOYAGE_API_KEY)
```

Contoh isi penting ada di `.env.example` di root.

## 2. Jalanin

```bash
docker compose up --build
```

Tunggu sampai 3 container healthy.

## 3. Buka

- Frontend : http://localhost:3000
- Backend : http://localhost:3001/health
- AI/RAG  : http://localhost:8000/docs

## Ganti URL production

Edit `docker-compose.yml` bagian `frontend.build.args`:

```yaml
VITE_API_URL: https://api-domain-kamu
VITE_RAG_API_URL: https://ai-domain-kamu
VITE_SOCKET_URL: https://api-domain-kamu
```

Lalu `docker compose up --build` lagi.

## Perintah berguna

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f backend-ai
docker compose down
```

## Dev tanpa Docker (opsional)

```bash
# terminal 1 - AI
cd backend_ai && uvicorn main:app --reload --port 8000
# terminal 2 - backend
cd backend && npm install && npm run dev
# terminal 3 - frontend
cd frontend && npm install && npm start
```
