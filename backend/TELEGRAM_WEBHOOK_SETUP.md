# Telegram Webhook Auto-Setup

Webhook Telegram sekarang **otomatis ter-setup** tanpa perlu menjalankan script manual.

## Konfigurasi

Edit file `backend/.env`:

```env
TELEGRAM_WEBHOOK_URL=https://your-cloudflare-tunnel-url.trycloudflare.com/api/webhooks/telegram
```

## Kapan Webhook Auto-Setup?

Webhook akan otomatis di-setup pada:

### 1. **Saat Server Start** ✅
- Server akan otomatis setup webhook untuk integration Telegram yang ACTIVE
- Lihat log console untuk konfirmasi:
  ```
  ✅ Telegram: Webhook set to https://...
  ✅ Telegram: Webhook verified successfully
  ```

### 2. **Saat Membuat Integration Baru** ✅
- POST `/api/integrations` dengan platform TELEGRAM
- Webhook langsung di-setup otomatis

### 3. **Saat Update Integration** ✅
- PUT `/api/integrations/:id` dengan update botToken
- Webhook otomatis di-update

### 4. **Saat Aktivasi Integration** ✅
- PATCH `/api/integrations/:id/toggle` untuk mengaktifkan
- Webhook otomatis di-setup saat status berubah ke ACTIVE

## Cara Ganti Domain

Kalau domain Cloudflare Tunnel berubah:

1. Edit `backend/.env`:
   ```env
   TELEGRAM_WEBHOOK_URL=https://new-domain.trycloudflare.com/api/webhooks/telegram
   ```

2. Restart server:
   ```bash
   cd backend
   npm start
   ```

3. Webhook otomatis ter-update! ✅

## Manual Setup (Opsional)

Kalau mau setup manual, masih bisa pakai script:

```bash
cd backend
node setup-telegram-webhook.js
```

## Troubleshooting

### Webhook tidak ter-setup?

Cek log console saat server start:
- ✅ `Telegram: Webhook set to ...` → Berhasil
- ⚠️ `Telegram: No active integration found` → Belum ada integration ACTIVE
- ⚠️ `Telegram: TELEGRAM_WEBHOOK_URL not set` → Belum set di .env
- ❌ `Telegram: Failed to setup webhook` → Ada error, cek detail error

### Verifikasi Webhook

Cek webhook info via API:
```bash
GET /api/telegram/webhook?integrationId=xxx
```

Response:
```json
{
  "success": true,
  "data": {
    "url": "https://your-domain.trycloudflare.com/api/webhooks/telegram",
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```
