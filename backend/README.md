# OmniChat Backend

> Cara termudah: dari folder root jalankan `docker compose up --build` (lihat `README.md` / `DOCKER.md`).
> Langkah manual di bawah hanya untuk dev tanpa Docker.

Backend API untuk aplikasi OmniChat yang menyediakan integrasi dengan berbagai platform messaging seperti Telegram, WhatsApp, Discord, dan Slack. Menggunakan **Prisma ORM** dengan **PostgreSQL** di **Supabase**.

## 🚀 Fitur

- **Multi-Platform Integration**: Dukungan untuk Telegram, WhatsApp, Discord, dan Slack
- **Real-time Messaging**: Webhook handling untuk pesan real-time
- **Prisma ORM**: Type-safe database operations dengan PostgreSQL
- **Supabase Integration**: Database hosting dengan connection pooling
- **Analytics**: Tracking pesan dan statistik penggunaan
- **Security**: Rate limiting, authentication, dan validasi input
- **Logging**: Comprehensive logging untuk debugging dan monitoring

## 📋 Prerequisites

- Node.js (v16 atau lebih baru)
- npm atau yarn
- Supabase account dan project
- Telegram Bot Token (dari @BotFather)

## 🛠️ Installation

1. **Clone repository dan masuk ke folder backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit file .env dengan konfigurasi Anda**
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/webhooks/telegram

   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Database Configuration (Prisma + Supabase)
   DATABASE_URL="postgres://postgres.[your-supabase-project]:[password]@aws-0-[aws-region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgres://postgres.[your-supabase-project]:[password]@aws-0-[aws-region].pooler.supabase.com:5432/postgres"

   # Security
   JWT_SECRET=your_jwt_secret_here
   API_KEY=your_api_key_here

   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

5. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

6. **Push database schema to Supabase**
   ```bash
   npm run db:push
   ```

7. **Seed database dengan sample data (optional)**
   ```bash
   npm run db:seed
   ```

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Development dengan Setup Check
```bash
npm run dev:setup
```

Server akan berjalan di `http://localhost:3001`

## 🗄️ Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Create and run migrations (for production)
npm run db:migrate

# Deploy migrations (for production)
npm run db:migrate:deploy

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

### Database Schema

Prisma schema terletak di `prisma/schema.prisma` dengan model:

- **Integration**: Konfigurasi integrasi platform
- **TelegramChat**: Data chat Telegram
- **TelegramMessage**: Pesan Telegram
- **WhatsAppChat**: Data chat WhatsApp
- **WhatsAppMessage**: Pesan WhatsApp
- **ConversationThread**: Thread percakapan lintas platform
- **MessageAnalytics**: Analitik pesan harian
- **WebhookLog**: Log webhook requests
- **ApiUsageLog**: Log penggunaan API
- **SystemLog**: Log sistem
- **User**: Manajemen user
- **ApiKey**: API keys untuk autentikasi

## 📊 API Endpoints

### Health Check
- `GET /health` - Check server dan database status

### Integrations
- `GET /api/integrations` - Get all integrations
- `POST /api/integrations` - Create new integration
- `GET /api/integrations/:id` - Get integration by ID
- `PUT /api/integrations/:id` - Update integration
- `DELETE /api/integrations/:id` - Delete integration
- `PATCH /api/integrations/:id/toggle` - Toggle integration status
- `GET /api/integrations/:id/stats` - Get integration statistics

### Telegram
- `GET /api/telegram/bot-info` - Get bot information
- `POST /api/telegram/webhook` - Set webhook URL
- `GET /api/telegram/webhook` - Get webhook info
- `DELETE /api/telegram/webhook` - Delete webhook
- `POST /api/telegram/send-message` - Send message
- `GET /api/telegram/messages/:chatId` - Get chat messages
- `GET /api/telegram/chats` - Get all chats
- `GET /api/telegram/chats/:chatId` - Get chat by ID

### Webhooks
- `POST /api/webhooks/telegram` - Telegram webhook endpoint

### Platforms
- `GET /api/platforms/stats` - Get platform statistics
- `GET /api/platforms/supported` - Get supported platforms
- `GET /api/platforms/:platform/config-template` - Get config template
- `POST /api/platforms/:platform/validate-config` - Validate config

## 🔧 Configuration

### Supabase Setup

1. **Buat project baru di Supabase**
2. **Dapatkan connection strings dari Settings > Database**
   - Connection pooling URL (untuk DATABASE_URL)
   - Direct connection URL (untuk DIRECT_URL)
3. **Update .env file dengan URLs tersebut**

### Telegram Bot Setup

1. **Buat bot baru dengan @BotFather di Telegram**
   - Kirim `/newbot` ke @BotFather
   - Ikuti instruksi untuk membuat bot
   - Simpan token yang diberikan

2. **Set webhook (untuk production)**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://your-domain.com/api/webhooks/telegram"}'
   ```

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma         # Prisma database schema
│   ├── seed.js              # Database seeding script
│   └── generated/           # Generated Prisma client
├── config/
│   └── supabase.js          # Supabase + Prisma configuration
├── services/
│   ├── telegramService.js   # Telegram service
│   └── databaseService.js   # Database operations service
├── routes/
│   ├── integrations.js      # Integration routes
│   ├── telegram.js          # Telegram routes
│   ├── webhooks.js          # Webhook routes
│   └── platforms.js         # Platform routes
├── middleware/
│   └── auth.js             # Authentication middleware
├── utils/
│   ├── helpers.js          # Utility functions
│   └── logger.js           # Logging utilities
├── scripts/
│   └── start-dev.js        # Development startup script
├── test/
│   └── server.test.js      # Test suite
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── server.js              # Main server file
├── prisma.config.ts       # Prisma configuration
└── README.md              # This file
```

## 🔐 Security

- **Rate Limiting**: Membatasi jumlah request per IP
- **Input Validation**: Validasi semua input menggunakan express-validator
- **CORS**: Konfigurasi CORS untuk frontend
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data disimpan di environment variables
- **Type Safety**: Prisma memberikan type safety untuk database operations

## 📝 Logging

- **Console Logging**: Log ke console dengan level berbeda
- **Database Logging**: Prisma query logging (development mode)
- **Webhook Logging**: Log semua webhook requests ke database
- **API Usage Logging**: Track penggunaan API ke database
- **System Logging**: Log sistem ke database

## 🧪 Testing

```bash
npm test
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Prisma Studio (Database GUI)
```bash
npm run db:studio
```

### Platform Statistics
```bash
curl http://localhost:3001/api/platforms/stats
```

## 🚀 Deployment

### Environment Variables untuk Production
```env
NODE_ENV=production
DATABASE_URL="postgres://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Deploy Migrations
```bash
npm run db:migrate:deploy
```

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name "omnichat-backend"
```

### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `DATABASE_URL` | PostgreSQL connection URL (pooled) | Yes |
| `DIRECT_URL` | PostgreSQL direct connection URL | Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Yes (for Telegram) |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | JWT secret key | No |
| `API_KEY` | API key for authentication | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Check logs di console atau database
2. Pastikan semua environment variables sudah diset dengan benar
3. Verifikasi koneksi ke Supabase dengan `npm run db:studio`
4. Test Telegram bot token dengan API Telegram langsung
5. Check Prisma schema dengan `npx prisma validate`

## 🔄 Database Commands

```bash
# Setup dan generate Prisma client
npm run db:generate

# Push schema ke database (development)
npm run db:push

# Create migration (production)
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Seed database dengan sample data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## 📱 Platform Integration Status

- ✅ **Telegram**: Fully implemented dengan Prisma
- 🚧 **WhatsApp**: Schema ready, implementation pending
- 🚧 **Discord**: Schema ready, implementation pending
- 🚧 **Slack**: Schema ready, implementation pending

## 🎯 Prisma Features

- ✅ **Type Safety**: Full TypeScript support
- ✅ **Connection Pooling**: Optimized untuk Supabase
- ✅ **Migrations**: Database schema versioning
- ✅ **Introspection**: Generate schema dari existing database
- ✅ **Studio**: Visual database browser
- ✅ **Seeding**: Automated sample data creation
- ✅ **Relations**: Complex data relationships
- ✅ **Transactions**: ACID compliance