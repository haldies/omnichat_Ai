# OmniChat — Omnichannel Customer Engagement Platform

Platform komunikasi omnichannel dengan AI Agent berbasis RAG: Command Center, AI knowledge base (upload PDF), dan integrasi Telegram / WhatsApp / Instagram / Messenger.


```bash
# 1. Siapkan env 
cp backend/.env.example backend/.env
cp backend_ai/.env.example backend_ai/.env
# Isi yang wajib: lihat tabel di bawah

# 2. Jalanin
docker compose up --build

# 3. Buka
# Frontend : http://localhost:3000
# Backend  : http://localhost:3001/health
# AI/RAG   : http://localhost:8000/docs
```

Perintah berguna:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f backend-ai
docker compose down
```

Detail: lihat `DOCKER.md` dan `.env.example`.

## Env yang wajib diisi

| File | Key | Dapat dari mana |
| --- | --- | --- |
| `backend/.env` | `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → Database / API |
| `backend/.env` | `JWT_SECRET` | Isi string acak panjang |
| `backend_ai/.env` | `GROQ_API_KEY` | https://console.groq.com/keys |
| `backend_ai/.env` | `QDRANT_URL`, `QDRANT_API_KEY` | Cloud Qdrant dashboard |
| `backend_ai/.env` | `VOYAGE_API_KEY` | Voyage AI dashboard |
| `backend/.env` | `TELEGRAM_BOT_TOKEN` | @BotFather (opsional, kalau pakai Telegram) |

Contoh nilai default ada di `backend/.env.example` dan `backend_ai/.env.example`.

## Service & port

| Service | Folder | Port | Keterangan |
| --- | --- | --- | --- |
| Frontend (React + Vite) | `frontend/` | 3000 | Web app (Nginx di Docker) |
| Backend (Node + Express + Socket.io) | `backend/` | 3001 | REST API & WebSocket, `GET /health` |
| Backend AI (Python + FastAPI + LangChain) | `backend_ai/` | 8000 | RAG service, docs di `/docs` |

Arsitektur:

```
Frontend (3000) ──┬── Backend (3001) ── PostgreSQL / Supabase
                  └── Backend AI (8000) ── Qdrant + Groq + Voyage AI
```

Di dalam Docker, backend memanggil AI via `http://backend-ai:8000` (sudah diatur di `docker-compose.yml`), jadi tidak perlu ubah `RAG_API_URL` manual.

## Dev tanpa Docker (opsional)

Butuh Node 20, Python 3.11, dan env yang sama seperti di atas.

```bash
# Terminal 1 — AI
cd backend_ai
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Backend
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev

# Terminal 3 — Frontend
cd frontend
npm install
npm start
```

## Struktur proyek

```
omnichat/
├── frontend/        # React + Vite + Tailwind
├── backend/         # Node.js API (Express, Prisma, Socket.io)
├── backend_ai/      # Python AI / RAG (FastAPI, LangChain)
├── docker-compose.yml
├── .env.example
├── DOCKER.md
└── README.md
```

## Troubleshooting

- `docker compose config` error → pastikan dijalankan dari folder root (sejajar `docker-compose.yml`).
- Backend `unhealthy` → cek `docker compose logs backend`, biasanya `DATABASE_URL` / Supabase belum benar.
- AI `unhealthy` → cek `docker compose logs backend-ai`, biasanya `GROQ_API_KEY` / `QDRANT_*` / `VOYAGE_API_KEY` kosong.
- Frontend blank / gagal fetch → rebuild dengan args yang benar (`VITE_API_URL`, `VITE_RAG_API_URL` di `docker-compose.yml`), lalu `docker compose up --build`.
- Port bentrok → ubah mapping di `docker-compose.yml` (misal `"3000:80"` jadi `"8080:80"`).

## License

MIT — OmniChat Team
